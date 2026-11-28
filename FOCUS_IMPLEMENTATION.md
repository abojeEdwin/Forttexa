# Focus Management Implementation for Issue #53

## Summary
Implemented keyboard focus preservation when navigating between decision steps in the DecisionConsole component.

## Changes Made

### 1. Modified Components

#### `src/components/decision-console.tsx`
- **Added imports**: `useRef` from React
- **Added refs**: Created refs for each step heading (step1HeadingRef through step4HeadingRef)
- **Added tracking ref**: `isUserNavigationRef` to distinguish user-driven navigation from automatic step changes
- **Added focus management effect**: useEffect that focuses the appropriate heading when step changes due to user navigation
- **Added navigation helper**: `navigateToStep()` function that marks navigation as user-driven before changing step
- **Updated button handlers**: All Continue and Back buttons now call `navigateToStep()` instead of `setStep()`
- **Added heading attributes**: Each CardTitle now has `ref` and `tabIndex={-1}` to make them programmatically focusable

#### `src/components/ui/card.tsx`
- **Converted CardTitle to forwardRef**: Made CardTitle component accept and forward refs to the underlying h3 element
- **Added forwardRef import**: Import forwardRef from React
- **Added displayName**: Set CardTitle.displayName for better debugging

### 2. Test File Created
- **`src/components/decision-console.focus.test.tsx`**: Comprehensive test suite covering:
  - Focus moves to step 2 heading when clicking Continue from step 1
  - Focus moves to step 1 heading when clicking Back from step 2
  - Focus does NOT move during initial page render
  - All step headings have tabIndex=-1 for programmatic focus
  - Focus does NOT move during automatic step changes (after decision evaluation)

## Acceptance Criteria Met

✅ **Move focus to the next step heading after user-driven navigation**
   - Implemented with `navigateToStep()` helper and useEffect hook

✅ **Cover Continue and Back buttons**
   - All Continue buttons: Step 1→2
   - All Back buttons: Step 2→1, Step 3→2, Step 4→3/2

✅ **Avoid taking focus during initial page render**
   - Using `isUserNavigationRef` flag that starts as false
   - Effect only runs when flag is true (user-driven navigation)

✅ **Avoid taking focus during automatic transitions**
   - Automatic step changes (e.g., after decision evaluation) use `setStep()` directly
   - Only manual Continue/Back buttons use `navigateToStep()`

## Technical Details

### How It Works

1. **User clicks Continue or Back**: 
   - Button calls `navigateToStep(newStep)`
   - Function sets `isUserNavigationRef.current = true`
   - Function calls `setStep(newStep)`

2. **Step change triggers effect**:
   - Effect checks if `isUserNavigationRef.current` is true
   - If true, focuses the appropriate heading based on new step number
   - Resets flag to false

3. **Automatic step changes**:
   - Code calls `setStep()` directly (e.g., in `runDecision()`)
   - Effect sees `isUserNavigationRef.current` is false
   - No focus change occurs

### Accessibility Benefits

- **Keyboard users** maintain context when navigating between steps
- **Screen reader users** immediately hear the new step heading after navigation
- **tabIndex={-1}** ensures headings can receive programmatic focus without being in tab order
- **Semantic heading structure** (h3) maintained for proper document outline

## Testing

Run the test suite with:
```bash
npm test -- decision-console.focus.test
```

## Browser Compatibility

The implementation uses standard React refs and DOM focus() method, which are supported in all modern browsers.
