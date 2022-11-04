import { Fragment } from "react";
import { Helmet } from "react-helmet-async";

function Sources() {
  return (
    <Fragment>
      <Helmet>
        <title>Sources - Etherfuse</title>
      </Helmet>
      <h1>Sources</h1>
      <div>
        <a
          href="https://api.stakewiz.com/validators"
          style={{ fontSize: "1.5rem" }}
        >
          Stakewiz API
        </a>
      </div>
    </Fragment>
  );
}

export default Sources;
