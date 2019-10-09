import { useStaticQuery, graphql } from "gatsby"

const data = useStaticQuery(graphql`
  query HeaderQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`)

export default data
