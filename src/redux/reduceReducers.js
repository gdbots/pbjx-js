// @link https://github.com/acdlite/reduce-reducers
// here because npm install for one function drives me nuts
export default function reduceReducers(...reducers) {
  return (previous, current) =>
    reducers.reduce(
      (p, r) => r(p, current),
      previous,
    );
}
