import '../styles/globals.css';
import NoSsr from "../components/NoSsr";



function MyApp({ Component, pageProps }) {
  if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
    require("codemirror/lib/codemirror.css");
    require("codemirror/theme/dracula.css");
    require("codemirror/mode/python/python.js");
  }
  return (
    <NoSsr>
      <Component {...pageProps} />
    </NoSsr>
  )
}

export default MyApp
