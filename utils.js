// Note: this only works on the server side
export function getNetlifyContext() {
  return process.env.CONTEXT;
}

export function getNetlifyBuildId() {
  return process.env.BUILD_ID;
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export const uploadDisabled = process.env.NEXT_PUBLIC_DISABLE_UPLOADS?.toLowerCase() === 'true';
