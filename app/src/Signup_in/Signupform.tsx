import React, { useState } from 'react';

type FormProps = {
  onSignup: (email:string, password:string) => Promise<void>;
};


const Signupform: React.FC<FormProps> = ({ onSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  //枠を用意


  const Signup = async(e: React.FormEvent<HTMLFormElement>) =>{
      e.preventDefault();
      try{
        await onSignup(email, password);
        console.log("Success")
        setEmail("");
        setPassword("");
      }catch(error){
        console.log(error)
      }
  };
  return(
    <form  onSubmit={Signup}>

      <div>
        <div>
        <label>email: </label>
        <input
          type={"text"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        ></input>
        </div>
      </div>

      <div>
        <div>
        <label>password: </label>
        <input
          type={"text"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        ></input>
        </div>
      </div>
      <div>
        <button type={"submit"}>
        アカウントを作成
        </button>
      </div>
    </form>

  );
};
export default Signupform