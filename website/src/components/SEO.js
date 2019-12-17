import React from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { useStaticQuery, graphql } from "gatsby";

function SEO({ description = "", lang = "en", meta = [], title }) {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            author
          }
        }
      }
    `
  );

  const metaDescription = description || site.siteMetadata.description || "";

  return (
    <Helmet
      htmlAttributes={{ lang }}
      title={title || site.siteMetadata.title}
      titleTemplate={
        !title || title === site.siteMetadata.title
          ? title
          : `%s — ${site.siteMetadata.title}`
      }
      meta={[
        { name: "description", content: metaDescription },
        { property: "og:title", content: title },
        { property: "og:description", content: metaDescription },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:creator", content: site.siteMetadata.author },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: metaDescription }
      ].concat(meta)}
    />
  );
}

SEO.propTypes = {
  description: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.arrayOf(PropTypes.object),
  title: PropTypes.string
};

export default SEO;
