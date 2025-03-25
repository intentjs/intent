import { join } from "path";
import { format, Options, resolveConfig, resolveConfigFile } from "prettier";
import {
  Project,
  SourceFile,
  SyntaxKind,
  ObjectLiteralExpression,
  Node,
} from "ts-morph";
import { pathExists } from "fs-extra/esm";

export class InjectConfig {
  private project: Project;
  private sourceFile: SourceFile;

  constructor(
    private projectRoot: string,
    filePath: string
  ) {
    this.project = new Project({
      manipulationSettings: { useTrailingCommas: true },
    });
    this.sourceFile = this.project.addSourceFileAtPath(filePath);
  }

  /**
   * Injects a key-value pair into the AST at the specified path
   */
  public async handle(registryObject: Record<string, any>): Promise<void> {
    const objects = this.traverseToTargetObject(registryObject.key);

    if (!objects) {
      console.log("Target object not found");
      return;
    }

    const propertyAdded = this.updateObjectProperties(objects, registryObject);
    if (propertyAdded) {
      this.addImports(registryObject);
      await this.saveChanges(objects);
    }
  }

  addImports(registryObject: Record<string, any>): void {
    const { imports = [] } = registryObject;
    if (!imports || !imports.length) return;

    for (const importObj of imports) {
      if (importObj.namedImports) {
        this.sourceFile.addImportDeclaration({
          namedImports: importObj.namedImports,
          moduleSpecifier: importObj.moduleSpecifier,
        });
      }
    }
  }

  /**
   * Traverses the AST to find the target object based on the path
   */
  private traverseToTargetObject(
    pathArray: string[]
  ): ObjectLiteralExpression | undefined {
    let currentObject = this.getObjectLiteral();

    if (!currentObject) return undefined;

    // Traverse the path except the last element (which is the key to be set)
    for (let i = 0; i < pathArray.length - 1; i++) {
      const property = currentObject.getProperty(pathArray[i]) as
        | ObjectLiteralExpression
        | undefined;
      if (!property) return undefined;

      currentObject = property.getFirstChildByKind(
        SyntaxKind.ObjectLiteralExpression
      );

      if (!currentObject) return undefined;
    }

    return currentObject;
  }

  /**
   * Updates the properties of the target object
   */
  private updateObjectProperties(
    objects: ObjectLiteralExpression,
    registryObject: Record<string, any>
  ): boolean {
    // Remove existing properties
    const initializerName = registryObject.key[registryObject.key.length - 1];
    let propAlreadyExists = false;
    objects.getProperties().forEach((property) => {
      const propName = property.getSymbol()?.getName();
      if (propName !== initializerName) {
        property.remove();
      } else {
        propAlreadyExists = true;
      }
    });

    if (propAlreadyExists) return false;

    // Add new property
    const newConfig = objects
      .addPropertyAssignment({
        name: initializerName,
        initializer: "{}",
      })
      .getInitializer();

    if (Node.isObjectLiteralExpression(newConfig)) {
      for (const [key, value] of Object.entries(registryObject.value)) {
        newConfig.addPropertyAssignment({
          name: key,
          initializer:
            typeof value === "string"
              ? value.includes("env://")
                ? value.replaceAll("env://", "process.env.")
                : `"${value}"`
              : JSON.stringify(value),
        });
      }
      return true;
    }

    return false;
  }

  transformEnvValues(obj: Record<string, any>) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => {
        if (typeof value === "string" && value.startsWith("env://")) {
          return [key, `process.env.${value.replace("env://", "")}`];
        }
        return [key, value];
      })
    );
  }

  /**
   * Saves the changes to the file
   */
  private async saveChanges(objects: ObjectLiteralExpression): Promise<void> {
    const updatedText = objects.getText().replace(/,\s*,/g, ",");
    objects.replaceWithText(updatedText);

    let prettierConfig = null;
    if (await pathExists(join(this.projectRoot, ".prettierrc"))) {
      prettierConfig = await resolveConfig(this.projectRoot, {
        config: join(this.projectRoot, ".prettierrc"),
      });
    }

    const formatted = await format(this.sourceFile.getFullText(), {
      parser: "typescript",
      ...(prettierConfig || {}),
    });

    this.sourceFile.replaceWithText(formatted);
    this.sourceFile.saveSync();
  }

  /**
   * Gets the root object literal from the source file
   */
  private getObjectLiteral(): ObjectLiteralExpression | undefined {
    // Check for regular return statement
    const returnStatement = this.sourceFile.getFirstDescendantByKind(
      SyntaxKind.ReturnStatement
    );

    if (returnStatement) {
      return returnStatement.getFirstDescendantByKind(
        SyntaxKind.ObjectLiteralExpression
      );
    }

    // Check for arrow function
    const arrowFunction = this.sourceFile.getFirstDescendantByKind(
      SyntaxKind.ArrowFunction
    );

    if (!arrowFunction) {
      return undefined;
    }

    // Check for parenthesized object literal
    const parenthesized = arrowFunction.getFirstDescendantByKind(
      SyntaxKind.ParenthesizedExpression
    );

    if (parenthesized) {
      return parenthesized.getFirstDescendantByKind(
        SyntaxKind.ObjectLiteralExpression
      );
    }

    // Check for direct object literal
    return arrowFunction.getFirstDescendantByKind(
      SyntaxKind.ObjectLiteralExpression
    );
  }
}
