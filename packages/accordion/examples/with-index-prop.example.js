import * as React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
} from "@reach/accordion";
import { action } from "@storybook/addon-actions";
import "@reach/accordion/styles.css";

let name = "With index prop on items";

function Example() {
  let [items, setItems] = React.useState([
    {
      button: "Item 1",
      panel: `Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur pretium, lacus nunc consequat id viverra facilisi ligula eleifend, congue gravida malesuada proin scelerisque luctus est convallis.`,
    },
    {
      button: "Item 2",
      panel: `Exercitationem incidunt eius nobis tempore fugiat laboriosam odio inventore! Molestias hic aliquid veniam id, quia, recusandae tenetur magni error et eos perferendis. Deserunt eius voluptate doloremque!`,
      disabled: true,
    },
    {
      button: "Item 3",
      panel: `At, quas? Alias impedit, facilis voluptatibus commodi laboriosam sunt explicabo harum, nulla aliquid autem atque asperiores veniam obcaecati ipsum, ad recusandae architecto.`,
    },
  ]);
  return (
    <div>
      <button
        disabled={items.length >= 10 || undefined}
        onClick={() => {
          setItems((items) => {
            return items.length >= 10
              ? items
              : [
                  ...items,
                  {
                    button: `Item ${getRandomId()}`,
                    panel: getLoremIpsum(),
                  },
                ];
          });
        }}
      >
        Add Item
      </button>
      <button
        disabled={items.length <= 3 || undefined}
        onClick={() => {
          setItems((items) => {
            return items.length <= 3 ? items : items.slice(0, -1);
          });
        }}
      >
        Remove Item
      </button>
      <button
        onClick={() => {
          setItems((items) => {
            return [...items].sort(() => 0.5 - Math.random());
          });
        }}
      >
        Shuffle Items
      </button>
      <Accordion onChange={action(`Selecting panel`)}>
        {items.map((item, index) => {
          return (
            <AccordionItem
              key={item.button}
              disabled={item.disabled}
              index={index}
            >
              <h3>
                <AccordionButton>{item.button}</AccordionButton>
              </h3>
              <AccordionPanel>{item.panel}</AccordionPanel>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

Example.storyName = name;
export { Example };

function getLoremIpsum() {
  const things = [
    `Fuga dignissimos dolorum, ex voluptate quia nihil explicabo sint recusandae accusamus eveniet optio laudantium nemo quidem tempora soluta quam, mollitia ipsam unde. Assumenda pariatur at, iusto.`,
    `Ratione amet maxime ab dolores, qui explicabo consequuntur natus esse totam recusandae illo dolor, perspiciatis quam magni rem! Ratione eius vero accusamus, quo eveniet tempore temporibus consectetur maiores, ut ducimus itaque.`,
    `Recusandae soluta consequuntur quam tenetur nemo impedit vel fuga. Itaque cupiditate necessitatibus quos, cumque temporibus eveniet officia doloremque inventore culpa aspernatur explicabo, voluptatibus.`,
    `At vero ad libero rem aut! Deleniti, a. Provident iusto voluptate qui deserunt obcaecati nam omnis sint, ratione, molestiae saepe consequatur labore esse maiores officia ullam in sunt! Qui, animi? Vel provident in quidem.`,
    `Aperiam saepe possimus quod mollitia rem assumenda natus, maxime dolor ea repellat quos minima nihil ratione, ullam accusamus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos numquam quibusdam illum ex possimus vitae voluptatem ullam aspernatur excepturi?`,
  ];
  return things[Math.floor(Math.random() * things.length)];
}

function getRandomId() {
  let d = new Date().getTime();
  let d2 = (performance && performance.now && performance.now() * 1000) || 0;
  return "xyxyxy".replace(/[xy]/g, (c) => {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}
