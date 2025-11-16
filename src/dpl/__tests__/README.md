# A&A Golden Example Test Suite

This directory contains regression tests for the most critical duct calculation functions.

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

## Test Coverage

The test suite covers:

- **A7A** - Round Elbow (R/D) with RNCF correction
- **A7B** - Round Mitered Elbow
- **A7C** - Round Smooth Radius Elbow (R/D < 0.5)
- **A8A** - Round Conical Expansion (both legacy and interpolated modes)
- **A9A1** - Round Conical Contraction
- **A11E** - Diverging Junction Round Tee (branch + main)

## Test Structure

Each test file:
1. Imports the calc function and master data
2. Uses realistic input sets (typical duct sizes, angles, flows)
3. Asserts on calculated outputs with appropriate tolerances
4. Tests edge cases (low velocities, RNCF correction, extreme ratios)

## Expected Values

Test assertions use `toBeCloseTo()` with appropriate decimal places:
- Velocities: 1 decimal place
- Velocity pressures: 2-4 decimal places
- Loss coefficients: 2 decimal places
- Pressure losses: 2-4 decimal places

## Adding New Tests

To add tests for additional duct functions:

1. Create a new file: `AXX.test.ts`
2. Import the calc function and master data
3. Follow the pattern from existing tests
4. Use realistic inputs that match typical use cases
5. Calculate expected outputs manually or use verified results
