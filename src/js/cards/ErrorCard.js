import modalContent from "../pieces/modalContent";

const ErrorCard = () => {
  const { content } = modalContent(
    `<h1>Uh oh</h1>`,
    `<h3>Something went wrong!</h3>
     <p>See the console for details.</p>`,
    () => [
      undefined,
      {
        text: "Cancel",
        onClick: () => {
          gms.close();
        },
      },
    ]
  );

  return content;
};

export default ErrorCard;
