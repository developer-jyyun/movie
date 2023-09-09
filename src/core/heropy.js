///// Component /////
export class Component {
  constructor(payload = {}) {
    // 기본값 빈 객체로 할당
    const {
      //객체 구조분해 할당
      tagName = "div", // 최상위 요소의 태그 이름 기본값 div로
      props = {},
      state = {},
    } = payload;

    this.el = document.createElement(tagName); // 컴포넌트의 최상위 요소
    this.props = props; // 컴포넌트가 사용될 때 부모 컴포넌트에서 받는 데이터
    this.state = state; // 컴포넌트 안에서 사용할 데이터
    this.render();
  }
  render() {
    // 컴포넌트를 렌더링하는 함수
    // ...
  }
}

///// Router /////
// 페이지 렌더링!
function routeRender(routes) {
  // 접속할 때 해시 모드가 아니면(해시가 없으면) /#/로 리다이렉트!
  // 해쉬 없을 경우 : 매칭가능한 주소x : 출력 할 컴포넌트 찾을 수 없다.
  if (!location.hash) {
    //location.hash가 빈 문자열이면 (!거짓이면)
    history.replaceState(null, "", "/#/"); // (상태, 제목, 주소)
  }
  const routerView = document.querySelector("router-view");

  // 물음표를 기준으로 해시 정보와 쿼리스트링을 구분
  // 배열 구조분해 할당으로 배열의 0번째: hash, 1번째 queryString
  // #/about?name=heropy :: ["#/about","name=heropy"]

  const [hash, queryString = ""] = location.hash.split("?");
  //location.hash를 통해 현재 주소 확인
  //hash부분의 주소만 추출해서(queryString부분 제외한) 주소와 일치하는
  //routes(index.js의 createRouter 배열 데이터[]) 배열데이터의 내용을
  //find 메서드로 찾아 currentRoute 변수에 할당

  // 2) 현재 라우트 정보를 찾아서 렌더링!
  const currentRoute = routes.find((route) => {
    // /#\/about\?$.test(hash)
    return new RegExp(`${route.path}/?$`).test(hash);
  });
  routerView.innerHTML = "";
  //currentRoute의 component의 내용을 생성자 함수로 실행
  routerView.append(new currentRoute.component().el);

  // 1) 쿼리스트링을 객체로 변환해 히스토리의 상태에 저장!
  // queryString :: a=123&b=456 key value형태로되어 있다.
  // 쿼리를 {a:’123’, b:’456’}의 값을 얻도록 해보자!!
  const query = queryString.split("&").reduce((acc, cur) => {
    const [key, value] = cur.split("="); // 배열 구조 분해 할당
    acc[key] = value; // acc객체 데이터의 key에 value를 담아줌
    return acc; // 누적되는 값을 reduce의 콜백에서 반환
  }, {});

  // history 객체의 state에 객체 데이터 정보(쿼리스트링 정보)를 담음
  history.replaceState(query, ""); // (상태, 제목)

  // 3) 화면 출력 후 스크롤 위치 복구!
  window.scrollTo(0, 0);
}

export function createRouter(routes) {
  // 원하는(필요한) 곳에서 호출할 수 있도록 함수 데이터를 반환!
  return function () {
    window.addEventListener("popstate", () => {
      //페이지 주소 부분 바뀌면 한번씩 동작
      routeRender(routes);
    });
    routeRender(routes); //최초 호출 코드
  };
}

///// Store /////
export class Store {
  constructor(state) {
    this.state = {}; // 상태(데이터)
    this.observers = {};
    for (const key in state) {
      //객체 데이터 반복 for key in 객체이름
      // 각 상태에 대한 변경 감시(Setter) 설정!
      Object.defineProperty(this.state, key, {
        // Getter
        get: () => {
          //this.state 데이터의 key값 사용할 때
          return state[key];
        },
        // Setter
        set: (val) => {
          // this.state 데이터의 특정 속성의 값 할당 할 때
          console.log(val);
          state[key] = val;
          if (Array.isArray(this.observers[key])) {
            // 호출할 콜백이 있는 경우!
            this.observers[key].forEach((observer) => observer(val));
          }
        },
      });
    }
  }
  // 상태 변경 구독!
  subscribe(key, cb) {
    //삼항 연산자
    Array.isArray(this.observers[key]) // 이미 등록된 콜백이 있는지 확인!
      ? this.observers[key].push(cb) // 있으면 새로운 콜백 밀어넣기!
      : (this.observers[key] = [cb]); // 없으면 콜백 배열로 할당!

    // 예시)
    //   observers = {
    //     구독할상태이름: [실행할콜백1, 실행할콜백2]
    //     movies: [cb, cb, cb],
    //     message: [cb]
    //   }
  }
}
