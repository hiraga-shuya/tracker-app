import UserRegister_Form from "./UserRegister_Form";
import UserRegister_Message from "./UserRegister_Message";

export default function UserRegister() {
  return (
    <div style={{ padding: 24 }}>
      <UserRegister_Message />
      <UserRegister_Form />
    </div>
  );
}
