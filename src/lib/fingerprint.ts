import fpPromise from './fingerprintv3';

export async function getFingerprint() {
  return new Promise<string>((resolve) => {
    // Get the visitor identifier when you need it.
    const fp = fpPromise.load();

    fp.then((fp: any) => fp.get())
      .then((result: any) => {
        const visitorId = result.visitorId;
        resolve(visitorId);
      })
      .catch((error: any) => {
        console.error(error);
        resolve("");
      });
  });
}
