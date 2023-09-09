import { Store } from "../core/heropy";
const store = new Store({
  //생성자 함수 호출__인수로 객체데이터 추가
  searchText: "",
  page: 1,
  pageMax: 1,
  movies: [], //검색결과 영화
  movie: {}, //영화 상세정보
  loading: false,
  message: "Search for movie title!",
});

export default store;
export const searchMovies = async (page) => {
  store.state.loading = true;
  store.state.page = page;
  if (page === 1) {
    store.state.movies = [];
    store.state.message = "";
  }

  try {
    //내 api는 왜 에러나지..?
    //`https://www.omdbapi.com/?i=tt3896198&apikey=5d29f53c&s=${store.state.searchText}&page=${page}`
    //쌤: `https://omdbapi.com?apikey=7035c60c&s=${store.state.searchText}&page=${page}`

    const res = await fetch(
      `https://omdbapi.com?apikey=7035c60c&s=${store.state.searchText}&page=${page}`
    );

    //객체구조분해할당
    //네트워크 탭의 fetch/XHR. 미리보기 탭에서 totalResult, Response, Error 속성 확인 가능.
    const { Search, totalResults, Response, Error } = await res.json();
    // 영화 정보 정상적으로 가져온다면
    if (Response === "True") {
      //배열의 내용이 계속 누적 될 수 있도록 전개 연산자 사용.
      store.state.movies = [...store.state.movies, ...Search];
      store.state.pageMax = Math.ceil(Number(totalResults) / 10);
    } else {
      store.state.message = Error;
      store.state.pageMax = 1;
    }
  } catch (error) {
    console.log("searchMovies error", error);
  } finally {
    store.state.loading = false;
  }
};

//상세페이지
// `https://www.omdbapi.com/?i=tt3896198&apikey=5d29f53c&i=${id}&plot=full` 내 api는 왜 에러나지..?
// 쌤: https://omdbapi.com?apikey=7035c60c&i=${id}&plot=full
export const getMovieDetails = async (id) => {
  try {
    const res = await fetch(
      `https://omdbapi.com?apikey=7035c60c&i=${id}&plot=full`
    );
    store.state.movie = await res.json();
  } catch {
    console.log("상세 페이지 에러", error);
  }
};
// export const getMovieDetails = async (id) => {
//   try {
//     // const res = await fetch(`https://omdbapi.com?apikey=${APIKEY}&i=${id}&plot=full`)
//     const res = await fetch("/api/movie", {
//       method: "POST",
//       body: JSON.stringify({
//         id,
//       }),
//     });
//     store.state.movie = await res.json();
//   } catch (error) {
//     console.log("getMovieDetails error:", error);
//   }
// };
