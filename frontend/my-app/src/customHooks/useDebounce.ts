import { useEffect } from "react"
import useTimeout from "./useTimeout"

const useDebounce = <T>(callback: Function, delay: number, dependencies: T[]) => {
  const { reset, clear } = useTimeout(callback, delay)
  useEffect(reset, [...dependencies, reset])
  useEffect(clear, [])
}

export default useDebounce