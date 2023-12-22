import { useFetcher } from '@remix-run/react';
import { useEffect } from 'react';

/**
 * Custom hook to handle keyboard events.
 *
 * @param key The key that triggers the action.
 * @param action The submissionType action to be performed on key press.
 * @param endpoint The endpoint where the action will be submitted.
 * @example useKeyboard("e", "edit", `/recipes/${data.recipe.id}`); // Will trigger the edit action when the user presses the "e" key on the recipes/{recipeId} page
 */
export function useKeyboard(key: string, action: string, endpoint: string) {
  const fetcher = useFetcher();

  useEffect(() => {
    function handleKeyPress(event: KeyboardEvent) {
      if (event.key.toLowerCase() === key.toLowerCase()) {
        fetcher.submit({ action }, { method: 'post', action: endpoint });
      }
    }

    window.addEventListener('keydown', handleKeyPress);

    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [key, action, endpoint, fetcher]);
}
