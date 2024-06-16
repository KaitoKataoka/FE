import React from 'react';
import { fireAuth} from '../firebase.ts';
import {createUserWithEmailAndPassword} from "firebase/auth";
import Signinform from './Signinform.tsx';
import Signupform from './Signupform.tsx';


interface Signup_inProps {
  onAuthSuccess: () => void;
}

const Signup_in_App: React.FC<Signup_inProps> = ({ onAuthSuccess }) => {

  //emailでサインアップ
  const minLength = 8;
  const hasUpperCase = /[A-Z]/;
  const hasLowerCase = /[a-z]/;
  const hasNumber = /\d/;
  const hasSpecialChar = /[-!@#$%^&*(),.?":{}|<>]/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handlesignup = async (email: string, password: string)=> {
    return new Promise<void>(async (resolve, reject) => {
    var errormessage = ""

    if (password.length < minLength){
      alert("Password must be at least "+minLength+"characters long.")
      errormessage = "Password must be at least "+minLength+"characters long.";

    }
    if (!hasUpperCase.test(password)) {
      alert('Password must contain at least one uppercase letter.');
      errormessage='Password must contain at least one uppercase letter.';
    }else if (!hasLowerCase.test(password)) {
      alert('Password must contain at least one lowercase letter.');
      errormessage = 'Password must contain at least one lowercase letter.';
    }else if (!hasNumber.test(password)) {
      alert('Password must contain at least one number.');
      errormessage = 'Password must contain at least one number.';
    }else if (!hasSpecialChar.test(password)) {
      alert('Password must contain at least one special character.');
      errormessage = 'Password must contain at least one special character.';
    }else if(!emailRegex.test(email)) {
      alert ("Invalid email format.");
      errormessage = "Invalid email format.";
    }

    if (errormessage) {
      console.log(errormessage);
      reject(errormessage);
      return;
    }
    try {
      await createUserWithEmailAndPassword(fireAuth, email, password);
      console.log('User registered:');
      resolve();
      onAuthSuccess();
    }catch (error) {
      reject(error);
    }// 非同期処理が失敗した場合は reject する
  });
  };



  return (
    <div>
      <div>
        User Register
      </div>
      <div>
        <label>
          ~パスワードとメールアドレスで登録~
        </label>
        <Signupform onSignup={handlesignup} />
        <tr>
          <td>
          パスワードは以下の条件を満たしてください
          </td>
          <td>
          ・{minLength}文字以上
          </td>
          <td>
          ・一文字以上大文字、小文字、特殊文字が含まれている
          </td>
          <td>
          ・数字が一つ以上含まれている
          </td>
        </tr>
{/*onsubmitにhandlesubmitという関数を代入*/}
        <label>
            ~ログイン~
        </label>
        <Signinform />
      </div>
    </div>
  );
    };

export default Signup_in_App;
