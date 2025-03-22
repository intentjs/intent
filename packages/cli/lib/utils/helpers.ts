export const isFalsy = (value: string | boolean | number): boolean => {
  return ["false", "off", "0", false, 0].includes(value);
};

export const isTruthy = (value: string | boolean | number): boolean => {
  return ["true", "on", "1", true, 1].includes(value);
};

export const toBoolean = (value: string | boolean | number): boolean => {
  return isTruthy(value);
};

export const getTime = () => {
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours >= 12 ? "PM" : "AM";

  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = seconds.toString().padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;
};

export const isWindows = () => {
  return process.platform === "win32";
};
