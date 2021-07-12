import * as React from "react";
import { action } from "@storybook/addon-actions";
import {
  ListboxInput,
  ListboxButton,
  ListboxOption,
  ListboxList,
  ListboxPopover,
} from "@reach/listbox";
import styled from "styled-components";
import "@reach/listbox/styles.css";

let name = "With Styled Components";

function Example() {
  return (
    <StyledWrapper>
      <Label id="dev-label">Who has the best GitHub projects?</Label>
      <ListboxInput
        aria-labelledby="dev-label"
        onChange={action("value changed")}
      >
        <GithubListboxButton arrow="▼">
          {({ label }) => <ButtonLabel>{label}</ButtonLabel>}
        </GithubListboxButton>
        <GithubPopover>
          <GithubStyledList>
            {Object.entries(users).map(([userName, user]) => {
              return (
                <GithubUserOption
                  key={userName}
                  userName={userName}
                  {...user}
                />
              );
            })}
          </GithubStyledList>
        </GithubPopover>
      </ListboxInput>

      <hr style={{ margin: "10px 0", opacity: 0 }} />

      <Label id="twitter-label">Who has the best Tweets?</Label>
      <ListboxInput
        aria-labelledby="twitter-label"
        onChange={action("value changed")}
      >
        <TwitterListboxButton arrow="▼">
          {({ label }) => <ButtonLabel>{label}</ButtonLabel>}
        </TwitterListboxButton>
        <TwitterPopover>
          <TwitterStyledList>
            {Object.entries(users).map(([, user]) => {
              return <TwitterUserOption key={user.twitterHandle} {...user} />;
            })}
          </TwitterStyledList>
        </TwitterPopover>
      </ListboxInput>
    </StyledWrapper>
  );
}

function GithubUserOption({
  displayName,
  githubAvatar,
  twitterAvatar,
  twitterHandle,
  userName,
  ...props
}) {
  return (
    <GithubStyledOption value={userName} label={displayName} {...props}>
      <GithubOptionInner>
        <GithubAvatarWrapper>
          <GithubAvatar src={githubAvatar} alt={`Avatar for ${displayName}`} />
        </GithubAvatarWrapper>
        <GithubUserInfo>
          <GithubUserLabel>{displayName}</GithubUserLabel>
          <GithubUsername>{userName}</GithubUsername>
        </GithubUserInfo>
      </GithubOptionInner>
    </GithubStyledOption>
  );
}

function TwitterUserOption({
  displayName,
  githubAvatar,
  twitterAvatar,
  twitterHandle,
  userName,
  ...props
}) {
  return (
    <TwitterStyledOption value={twitterHandle} label={displayName} {...props}>
      <TwitterOptionInner>
        <TwitterAvatarWrapper>
          <TwitterAvatar
            src={twitterAvatar}
            alt={`Avatar for ${displayName}`}
          />
        </TwitterAvatarWrapper>
        <TwitterUserInfo>
          <TwitterUserLabel>{displayName}</TwitterUserLabel>
          <TwitterUsername>@{twitterHandle}</TwitterUsername>
        </TwitterUserInfo>
      </TwitterOptionInner>
    </TwitterStyledOption>
  );
}

Example.storyName = name;
export { Example };

/**
 * @typedef {Object} User
 * @property {string} displayName
 * @property {string} twitterHandle
 * @property {string} twitterAvatar
 * @property {string} githubAvatar
 */

/**
 * @type {Record<string, User}
 */
let users = {
  bradwestfall: {
    displayName: "Brad Westfall",
    twitterHandle: "bradwestfall",
    githubAvatar: "https://avatars3.githubusercontent.com/u/2272118?s=56&v=4",
    twitterAvatar: "https://avatars3.githubusercontent.com/u/2272118?s=56&v=4",
  },
  cassidoo: {
    displayName: "Cassidy Williams",
    twitterHandle: "cassidoo",
    githubAvatar: "https://avatars1.githubusercontent.com/u/1454517?s=56&v=4",
    twitterAvatar: "https://avatars1.githubusercontent.com/u/1454517?s=56&v=4",
  },
  chancestrickland: {
    displayName: "Chance Strickland",
    twitterHandle: "chancethedev",
    githubAvatar: "https://avatars2.githubusercontent.com/u/3082153?s=56&v=4",
    twitterAvatar: "https://avatars2.githubusercontent.com/u/3082153?s=56&v=4",
  },
  mjackson: {
    displayName: "Michael Jackson",
    twitterHandle: "mjackson",
    githubAvatar: "https://avatars2.githubusercontent.com/u/92839?s=56&v=4",
    twitterAvatar: "https://avatars2.githubusercontent.com/u/92839?s=56&v=4",
  },
  ryanflorence: {
    displayName: "Ryan Florence",
    twitterHandle: "ryanflorence",
    githubAvatar: "https://avatars1.githubusercontent.com/u/100200?s=56&v=4",
    twitterAvatar: "https://avatars1.githubusercontent.com/u/100200?s=56&v=4",
  },
};

let Label = styled.span`
  display: block;
  margin-bottom: 10px;
  font-weight: 700;
`;

let ButtonLabel = styled.span`
  flex-grow: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

let StyledWrapper = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial,
    sans-serif, Apple Color Emoji, Segoe UI Emoji;
`;

// Twitter styles
let TwitterListboxButton = styled(ListboxButton)`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
  color: #fff;
  user-select: none;
  border: 0;
  border-radius: 9999px;
  background: rgb(29, 161, 242);
  white-space: nowrap;
  cursor: pointer;
  width: 212px;
  max-width: 100%;
  height: 49px;
  max-height: 100%;
`;

let TwitterPopover = styled(ListboxPopover)`
  margin-top: 6px;
  &:focus-within {
    box-shadow: 0 0 0 2px rgb(29, 161, 242);
    outline: 0;
  }
`;

let TwitterStyledOption = styled(ListboxOption)`
  margin: 0;
  padding: 10px 15px;
  border-bottom: 1px solid rgb(230, 236, 240);

  &[data-highlighted] {
    background: rgb(245, 248, 250);
  }

  &[aria-selected="true"] {
    background: rgb(235, 238, 240);
  }

  &:last-of-type {
    border-bottom: 0;
  }
`;

let TwitterOptionInner = styled.div`
  display: flex;
  align-items: stretch;
`;

let TwitterAvatarWrapper = styled.div`
  text-align: center;
  width: 49px;
  margin: 0 5px;
`;

let TwitterAvatar = styled.img`
  display: inline-block;
  overflow: hidden;
  line-height: 1;
  vertical-align: middle;
  border-radius: 999px;
  border-style: none;
  max-width: 100%;
  height: auto;
`;

let TwitterUserInfo = styled.div`
  margin: 0 5px;
`;

let TwitterUserLabel = styled.span`
  display: block;
  color: #000;
  font-weight: 700;
`;

let TwitterUsername = styled.span`
  display: block;
  color: rgb(101, 119, 134);
  font-weight: 400;
`;

// Github styles
let GithubListboxButton = styled(ListboxButton)`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 500;
  line-height: 20px;
  color: #24292e;
  user-select: none;
  background-repeat: repeat-x;
  background-position: -1px -1px;
  background-size: 110% 110%;
  background-color: #eff3f6;
  border: 1px solid rgba(27, 31, 35, 0.2);
  border-radius: 0.25em;
  background-image: linear-gradient(-180deg, #fafbfc, #eff3f6 90%);
  white-space: nowrap;
  cursor: pointer;
  width: 140px;
  max-width: 100%;
`;

let GithubPopover = styled(ListboxPopover)`
  &:focus-within {
    box-shadow: 0 0 0 2px #a5cfff;
    outline: 0;
  }
`;

let TwitterStyledList = styled(ListboxList)`
  font-size: 15px;
  list-style: none;
  margin: 0;
  padding: 0;
`;

let GithubStyledList = styled(ListboxList)`
  font-size: 13px;
  list-style: none;
  margin: 0;
  padding: 0;
`;

let GithubStyledOption = styled(ListboxOption)`
  color: #6a737d;
  padding: 8px;
  display: block;
  overflow: hidden;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;

  &[data-highlighted] {
    background-color: #a5cfff;
    color: #111;
  }

  &[aria-selected="true"] {
    font-weight: inherit;
    color: #fff;
    text-decoration: none;
    background-color: #0366d6;
  }
`;

let GithubOptionInner = styled.div`
  display: flex;
  align-items: center;
`;

let GithubAvatarWrapper = styled.div`
  text-align: center;
  margin-right: 8px;
  width: 30px;
`;

let GithubAvatar = styled.img`
  display: inline-block;
  overflow: hidden;
  line-height: 1;
  vertical-align: middle;
  border-radius: 3px;
  border-style: none;
  max-width: 100%;
  height: auto;
`;

let GithubUserInfo = styled.div`
  font-size: 12px;
`;

let GithubUserLabel = styled.span`
  display: block;
  font-weight: 500;
`;

let GithubUsername = styled.span`
  display: block;
  font-weight: 400;
  color: #586069;

  /* prettier-ignore */
  ${GithubStyledOption}[data-highlighted] & {
    color: #111;
  }

  /* prettier-ignore */
  ${GithubStyledOption}[aria-selected="true"] & {
    color: #fff;
  }
`;
