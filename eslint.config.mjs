import expoConfig from 'eslint-config-expo/flat.js';

export default [
  ...expoConfig,
  {
    ignores: [
      'node_modules/',
      '.expo/',
      'dist/',
      'babel.config.js',
      'metro.config.js',
      'tailwind.config.js',
    ],
  },
  {
    rules: {
      // Warn on hex color literals outside of theme tokens file
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'Literal[value=/^#[0-9A-Fa-f]{3,8}$/]',
          message:
            'Hex color literals should only appear in src/shared/theme/tokens.ts. Use design tokens instead.',
        },
      ],
    },
  },
  {
    // Allow hex colors in the tokens file
    files: ['src/shared/theme/tokens.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
];
