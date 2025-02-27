import { RiseLoader } from "react-spinners";

export function LoadingComponent() {
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2">
        <RiseLoader color="#36d7b7" loading={true} size={20} />
    </div>
);
}
