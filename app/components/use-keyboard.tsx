import { useFetcher } from "@remix-run/react";
import { useEffect, useRef } from "react";

/**
 * Custom hook to handle keyboard events.
 *
 * @param key The key that triggers the action.
 * @param action The type of action to be performed on key press.
 * @param endpoint The endpoint where the action will be submitted.
 * @example useKeyboard("e", "edit", `/recipes/${data.recipe.id}`); // Will trigger the edit action when the user presses the "e" key on the recipes/{recipeId} page
 */
export function useKeyboard(key: string, action: string, endpoint: string) {
  const fetcher = useFetcher();

  useEffect(() => {
    function handleKeyPress(event: KeyboardEvent) {
      if (event.key.toLowerCase() === key.toLowerCase()) {
        fetcher.submit({ action }, { method: "post", action: endpoint });
      }
    }

    window.addEventListener("keydown", handleKeyPress);

    // Clean up
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [key, action, endpoint, fetcher]);
}

/**
 * A custom hook to handle keyboard event and submit a form
 * @param keyCombo The key combo that triggers the action.
 * @param formId The id of the form to be submitted.
 * @example useKeyboardSubmit(["alt", "shift", "e"], "recipe-form"); // Will submit the form with the id "recipe-form" when the user presses the "alt" + "shift" + "e" keys on the page
 */
export function useKeyboardSubmit(keyCombo: string[], formId: string) {
  const activeKeys = useRef(new Set());

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      activeKeys.current.add(event.key.toLowerCase());

      const allKeysPressed = keyCombo.every((key) =>
        activeKeys.current.has(key.toLowerCase()),
      );

      if (allKeysPressed) {
        const form = document.getElementById(formId) as HTMLFormElement | null;
        if (form) {
          form.requestSubmit();
        }
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      activeKeys.current.delete(event.key.toLowerCase());
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Clean up
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [keyCombo, formId]);

  // Clean up active keys on unmount
  useEffect(() => {
    return () => {
      activeKeys.current.clear();
    };
  }, []);
}

/**
 * Custom hook to handle keyboard events.
 *
 * @param keyCombo The key combo that triggers the action.
 * @param action The type of action to be performed on key press.
 * @param endpoint The endpoint where the action will be submitted.
 * @example useKeyboardCombo(["shift", "e"], "edit", `/recipes/${data.recipe.id}`); // Will trigger the edit action when the user presses the "shift" + "e" keys on the recipes/{recipeId} page
 */
export function useKeyboardCombo(
  keyCombo: string[],
  action: string,
  endpoint: string,
) {
  const fetcher = useFetcher();
  const activeKeys = useRef(new Set());
  useEffect(() => {
    function handleKeyPress(event: KeyboardEvent) {
      activeKeys.current.add(event.key.toLowerCase());

      const allKeysPressed = keyCombo.every((key) =>
        activeKeys.current.has(key.toLowerCase()),
      );
      if (allKeysPressed) {
        fetcher.submit({ action }, { method: "post", action: endpoint });
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      activeKeys.current.delete(event.key.toLowerCase());
    }

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keyup", handleKeyUp);

    // Clean up
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [keyCombo, action, endpoint, fetcher]);

  // Optional: Reset shift state if component unmounts
  useEffect(() => {
    return () => activeKeys.current.clear();
  }, []);
}
