import { Request, Response } from '@intentjs/hyper-express';
import { renderToPipeableStream, renderToString } from 'react-dom/server';
import { findProjectRoot } from '../utils/path.js';
import { join, resolve } from 'path';
import React from 'react';
import { Inject, Injectable } from '@nestjs/common';
import { ViteDevServer } from 'vite';
import { StaticRouter } from 'react-router-dom';
import { readFileSync } from 'fs';

@Injectable()
export class ReactRenderer {
  constructor(@Inject('VITE') private readonly vite: ViteDevServer) {}

  async renderUsingVite(resourceName: string, req: Request, res: Response) {
    const url = req.url;
    let template = readFileSync(
      join(findProjectRoot(), 'public', 'index.html'),
      'utf-8',
    );

    template = await this.vite.transformIndexHtml(url, template);

    console.log(template);

    const { render } = await this.vite.ssrLoadModule(
      resolve(process.cwd(), 'dist', 'resources', 'views', 'entry-server.js'),
    );

    console.log(render);
    const htmlParts = template.split('<!--ssr-outlet-->');
    const htmlStart = htmlParts[0];
    const htmlEnd = htmlParts[1];

    res.status(200);
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.write(htmlStart);

    const html = await render(url);
    res.write(html);
    res.write(htmlEnd);
  }

  async render(resourceName: string, req: Request, res: Response) {
    const props = { user: { name: 'John Doe', loggedIn: true } };

    let template = readFileSync(
      join(findProjectRoot(), 'public', 'index.html'),
      'utf-8',
    );

    const htmlParts = template.split('<!--ssr-outlet-->');
    const htmlStart = htmlParts[0];
    const htmlEnd = htmlParts[1];

    const { default: AppComponent } = await import(
      join(
        findProjectRoot(),
        'dist',
        'resources',
        'views',
        'pages',
        'contact.js',
      )
    );

    res.status(200);
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.write(htmlStart);

    console.log(AppComponent);
    console.log(renderToString(React.createElement(AppComponent, props)));

    const { pipe, abort } = renderToPipeableStream(
      React.createElement(AppComponent, props),
      {
        //   bootstrapScripts: ['./main.js'],
        onShellReady: () => {
          console.log('onShellReady');
          pipe(res);
        },
        onAllReady: () => {
          console.log('onAllReady');
          res.write(htmlEnd);
          res.end();
        },
        onError: error => {
          console.error('onError ==> ', error);
          abort();
          res.status(500).send('Internal Server Error');
        },
      },
    );

    req.on('close', () => {
      abort();
    });
  }
}
