import React from 'react';

const Singleinput = (props) => {

    const { cbOnChange } = props;

    return ( 
        <div>
            <label htmlFor="special_requirements"></label>
            <input name="special_requirements" onChange={(e) => cbOnChange(e.target.name,e.target.value)} />
        </div>
    )
}

export default Singleinput;