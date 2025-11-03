export type PostChain = {
  render: () => void
}

export const makePostChain = (_spec?: unknown): PostChain => {
  console.warn('[tsl-kit] Post processing chain is not implemented yet. Returning no-op chain.')
  return {
    render: () => {
      /* noop */
    },
  }
}

