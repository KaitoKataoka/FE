import React,{ useState } from "react";

type FormProps = {
  onSubmit: (name: string, age:string, username:string) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};
//onsubmitに代入されたhandlesubmitからデータを受け取る
const Profileform: React.FC<FormProps> = ({ onSubmit, onImageChange }) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [username, setUsername] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await onSubmit(name, age, username);
      setName("");
      setAge("");
      setUsername("");
    } catch (error) {
      console.log(error);
    }
  };


  return (
    <form  onSubmit={submit}>

        <div>
        <label>Profile Image:</label>
        <input type="file" onChange={onImageChange} />
      </div>

      <div>
      <label>Name: </label>
      <input
        type={"text"}
        value={name}
        onChange={(e) => setName(e.target.value)}
      ></input>
      </div>

      <div>
      <label>Age: </label>
      <input
        type={"text"}
        value={age}
        onChange={(e) => setAge(e.target.value)}
        ></input>
      </div>
      <div>半角で入力してください</div>

      <div>
      <label>Username: </label>
      <input
        type={"text"}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        ></input>
      </div>

      <div>
        <button type={"submit"}>
        save profile
        </button>
      </div>
    </form>
  );
};

export default Profileform;