/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const common = {
  modulePathIgnorePatterns: ['/npm'],
};

module.exports = {
  projects: [
    {
      ...common,
      displayName: 'unit',
      globals: {
        IS_REACT_ACT_ENVIRONMENT: true,
        __DEV__: true,
      },
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      transform: {
        '^.+\\.jsx?$': 'babel-jest',
        '^.+\\.tsx$': 'ts-jest',
      },
    },
    {
      ...common,
      displayName: 'e2e',
      testMatch: [
        '**/__tests__/e2e/**/*.js',
        '**/__tests__/regression/**/*.js',
      ],
    },
  ],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    }
  }
};

export {}