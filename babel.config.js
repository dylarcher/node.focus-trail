module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current', // Or specify browser targets e.g., "> 0.25%, not dead"
        },
      },
    ],
  ],
};
