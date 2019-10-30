/**
 * Generates a unique ID for handling DOM `id` attributes.
 * Note: The returned ID will initially be `null` and update after
 * a component mounts. Users may need to supply their own ID if
 * they need consistent values for SSR.
 */
declare const useId: () => number;
