import React from "react";
interface TitleProps {
  title: string;
  subHeading?: string;
}
const TitleSection: React.FC<TitleProps> = ({ title, subHeading }) => {
  // react fragment lagane ko bola tha
  return (
    <div>
      <h1>{title}</h1>
      {subHeading ? <h2>{subHeading}</h2> : <></>}
    </div>
  );
};
export default TitleSection;
