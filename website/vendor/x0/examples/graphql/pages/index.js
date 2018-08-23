import React from 'react'
import { request } from 'graphql-request'

const URL = 'https://api.graph.cool/simple/v1/cj90efsm60hka01721jcnbn53'

const App = props =>
  <div>
    <h1>GraphQL Example</h1>
    <div>
      {props.team.map(({ name, avatarUrl, location }) =>
        <div key={name}>
          <img
            src={avatarUrl}
            width='48'
            height='48'
          />
          <h2>{name}</h2>
          <div>{location}</div>
        </div>
      )}
    </div>
  </div>

App.getInitialProps = async () => {
  const query = `{
    allTeamMembers {
      avatarUrl
      location
      name
    }
  }`

  const { allTeamMembers } = await request(URL, query)

  return { team: allTeamMembers }
}

export default App
