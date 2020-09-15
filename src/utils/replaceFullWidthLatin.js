const replaceFullWidthLatin = (str) => (
  str.toLowerCase()
    .replace(/\uff21-\uff3a/, (val) => (
      // first character's value - (hex) a latin fullWidth + a ascii
      String.fromCharCode(val.charCodeAt(0) - 0xFF21 + 97)
    ))
);

export default replaceFullWidthLatin;
