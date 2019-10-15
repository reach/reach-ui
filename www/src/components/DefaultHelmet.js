import React from "react"
import Helmet from "react-helmet"
import { useStaticQuery, graphql } from "gatsby"

const DefaultHelmet = ({ meta = [], ...helmetProps }) => {
  const data = useStaticQuery(graphql`
    query HeaderQuery {
      site {
        siteMetadata {
          title
          description
        }
      }
    }
  `)

  return (
    <Helmet
      title={data.site.siteMetadata.title}
      meta={[
        {
          name: "description",
          content: data.site.siteMetadata.description,
        },
        ...meta,
      ]}
      {...helmetProps}
    />
  )
}

export default DefaultHelmet
