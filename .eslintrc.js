module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true,
    mocha: true,
    node: true
  },
  globals: {
    artifacts: false,
    assert: false,
    contract: false,
    web3: false
  },
  // This is needed to add configuration to rules with type information
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json']
  },
  ignorePatterns: [
    '.eslintrc.js',
    '**/types/truffle-contracts',
    'coverage',
    'dist/'
  ],
  rules: {
    'no-console': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/return-await': 'off',
    '@typescript-eslint/no-unnecessary-type-assertion': 'off'
  },
  overrides: [
    {
      files: '*',
      rules: {
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off'
      }
    },
    {
      files: [
        '**/test/**/*.ts'
      ],
      rules: {
        'no-unused-expressions': 'off',
        // chai assertions trigger this rule
        '@typescript-eslint/no-unused-expressions': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off'
      }
    },
    {
      // otherwise it will raise an error in every JavaScript file
      files: ['*.ts'],
      rules: {
        '@typescript-eslint/prefer-ts-expect-error': 'off'
      }
    }
  ]
}
