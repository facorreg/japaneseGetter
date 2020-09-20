const reject = (msg, err) => (
  Promise.reject(
    new Error(`${msg} ${err
      ? `because ${err.message || err}`
      : ''}`),
  )
);

export default reject;
