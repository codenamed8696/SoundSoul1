module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // This plugin for reanimated should be listed before module-resolver
      'react-native-reanimated/plugin', 
      
      // This is the module-resolver plugin for path aliases
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            // This defines the '@' alias to point to the root directory
            '@': '.', 
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        },
      ],
    ],
  };
};