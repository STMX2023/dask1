const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
      globals: {
        __DEV__: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        navigator: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        performance: 'readonly',
        require: 'readonly',
        React: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      'react': require('eslint-plugin-react'),
      'react-hooks': require('eslint-plugin-react-hooks'),
      'react-native': require('eslint-plugin-react-native'),
      'moti-animation-safety': {
        rules: {
          'prefer-moti-over-reanimated': {
            meta: {
              type: 'suggestion',
              docs: {
                description: 'Prefer Moti components over direct Reanimated usage for simple animations',
                category: 'Best Practices',
                recommended: true,
              },
              schema: [],
            },
            create(context) {
              return {
                'ImportDeclaration'(node) {
                  if (node.source.value === 'react-native-reanimated' && 
                      node.specifiers.some(spec => 
                        spec.type === 'ImportDefaultSpecifier' && spec.local.name === 'Animated')) {
                    context.report({
                      node,
                      message: 'Consider using MotiView/MotiText instead of Animated.View/Text for simple animations',
                    });
                  }
                },
              };
            },
          },
          'no-render-worklet': {
            meta: {
              type: 'error',
              docs: {
                description: 'Prevent worklet directive in non-worklet functions',
                category: 'Possible Errors',
                recommended: true,
              },
              schema: [],
            },
            create(context) {
              return {
                'FunctionDeclaration, FunctionExpression, ArrowFunctionExpression'(node) {
                  const body = node.body;
                  if (body && body.type === 'BlockStatement' && body.body.length > 0) {
                    const firstStatement = body.body[0];
                    if (firstStatement && firstStatement.type === 'ExpressionStatement' && 
                        firstStatement.expression && firstStatement.expression.type === 'Literal' && 
                        firstStatement.expression.value === 'worklet') {
                      // Check if this is inside useAnimatedStyle, useAnimatedReaction, or actual worklet
                      const parent = context.getSourceCode().getText(node.parent);
                      const isValidWorklet = parent.includes('useAnimatedStyle') || 
                                           parent.includes('useAnimatedReaction') || 
                                           parent.includes('runOnUI') ||
                                           parent.includes('withTiming') ||
                                           parent.includes('withSpring');
                      
                      if (!isValidWorklet) {
                        context.report({
                          node: firstStatement,
                          message: 'Worklet directive should only be used in actual worklet functions (useAnimatedStyle, runOnUI, etc.)',
                        });
                      }
                    }
                  }
                },
              };
            },
          },
        },
      },
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      
      // React performance rules (from PERFORMANCE_OPTIMIZATIONS.md)
      'react/display-name': 'error', // Required by best practices
      'react/no-array-index-key': 'warn',
      'react/no-unstable-nested-components': 'error',
      'react/jsx-no-constructed-context-values': 'error',
      'react/jsx-no-bind': 'error', // Critical for performance
      'react/jsx-no-useless-fragment': 'error',
      'react/jsx-pascal-case': 'error',
      'react/prefer-stateless-function': 'error',
      'react/self-closing-comp': 'error',
      'react/jsx-boolean-value': ['error', 'never'],
      'react/jsx-curly-brace-presence': ['error', 'never'],
      'react/no-adjacent-inline-elements': 'error',
      'react/no-danger': 'error',
      'react/no-deprecated': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-find-dom-node': 'error',
      'react/no-string-refs': 'error',
      'react/no-this-in-sfc': 'error',
      'react/no-typos': 'error',
      'react/no-unescaped-entities': 'error',
      'react/no-unknown-property': 'error',
      'react/no-unsafe': 'error',
      'react/void-dom-elements-no-children': 'error',
      
      // React Native specific rules (from BEST_PRACTICES.md)
      'react-native/no-raw-text': 'error',
      'react-native/no-inline-styles': 'error',
      'react-native/no-color-literals': 'warn',
      'react-native/split-platform-components': 'error',
      'react-native/no-unused-styles': 'error',
      'react-native/no-single-element-style-arrays': 'error',
      
      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error', // Upgraded from warn
      
      // Moti animation safety rules
      'moti-animation-safety/prefer-moti-over-reanimated': 'warn',
      'moti-animation-safety/no-render-worklet': 'error',
      
      // Performance and code quality
      'no-console': ['error', { allow: ['warn', 'error'] }], // Upgraded from warn
      'no-unused-vars': 'off', // Use TypeScript version instead
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-sequences': 'error',
      'no-void': 'error',
      'no-with': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-template': 'error',
      'object-shorthand': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'no-multi-spaces': 'error',
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'no-trailing-spaces': 'error',
      'comma-dangle': ['error', 'always-multiline'],
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      
      // React configuration
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'web-build/**',
      '*.config.js',
      'babel.config.js',
      'metro.config.js',
      'jest.config.js',
    ],
  },
];