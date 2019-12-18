module.exports = {
  pathPrefix: "/reach-ui/",
  siteMetadata: {
    title: "Reach UI",
    description:
      "The accessible foundation of your React apps and design systems.",
    author: "@reacttraining"
  },
  plugins: [
    "gatsby-plugin-react-helmet",
    {
      resolve: "gatsby-plugin-google-analytics",
      options: {
        trackingId: "UA-121796914-2"
      }
    },
    {
      resolve: "gatsby-plugin-mdx",
      options: {
        extensions: [".mdx", ".md"],
        defaultLayouts: {
          default: require.resolve("./src/components/mdx-layout.js")
        },
        gatsbyRemarkPlugins: [
          {
            resolve: "gatsby-remark-images"
          },
          {
            resolve: "gatsby-remark-emoji"
          },
          {
            resolve: "gatsby-remark-slug"
          },
          {
            resolve: "gatsby-remark-autolink-headers"
          }
        ]
      }
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "docs",
        path: `${__dirname}/../packages`,
        ignore: ["examples/**", "es/**", "umd/**"]
      }
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: `${__dirname}/src/images`
      }
    },
    {
      resolve: "gatsby-transformer-react-docgen",
      options: {
        resolver: require("react-docgen").resolver.findAllComponentDefinitions,
        babelrcRoots: ["../*"]
      }
    },
    "gatsby-transformer-sharp",
    "gatsby-plugin-sharp",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: "reach-ui",
        short_name: "reach-ui",
        start_url: "/",
        background_color: "#1159a6",
        theme_color: "#1159a6",
        display: "minimal-ui",
        icon: "src/images/reach-icon.png" // This path is relative to the root of the site.
      }
    },
    "gatsby-plugin-sass"
  ]
};
