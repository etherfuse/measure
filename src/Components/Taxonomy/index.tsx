import { Fragment } from "react";
import { Helmet } from "react-helmet-async";

function Taxonomy() {
  return (
    <Fragment>
      <Helmet>
        <title>Taxonomy - Etherfuse</title>
      </Helmet>
      <h1>Taxonomy</h1>
      <div>
        <ul style={{ fontSize: "1.5rem" }}>
          <li>Political</li>
          <p> - We measure political by the country of the IP.</p>
          <li>Regional</li>
          <p> - We measure regional by the continent of the IP.</p>
          <li>Corporate</li>
          <p> - We measure corporate by the organization of the IP and ASN.</p>
          <li>Ownership</li>
          <p> - We measure ownership by the stake weight.</p>
        </ul>
      </div>
      <div>
        <div>
          <a href="https://github.com/etherfuse/measure">
            Open a PR to contribute to the discussion
          </a>
        </div>
        <div>
          <a href="https://etherfuse.substack.com/p/measuring-proof-of-stake-networks">
            Original paper that inspired this project
          </a>
        </div>
      </div>
    </Fragment>
  );
}

export default Taxonomy;
