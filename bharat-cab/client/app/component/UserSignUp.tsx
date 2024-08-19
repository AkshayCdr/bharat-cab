import { Form } from "@remix-run/react";

export default function UserSignUp() {
    return (
        <Form
            method="POST"
            className="max-w-md mx-auto flex flex-col bg-gray-950 gap-8 m-5 p-10 rounded-lg opacity-70 text-white"
        >
            <input
                type="text"
                name="name"
                id=""
                required
                className="h-10 bg-gray-950 border-b-2  focus:outline-none text-2xl"
                placeholder="Name"
            />

            <input
                type="email"
                name="email"
                id=""
                className="h-10  bg-gray-950 border-b-2  focus:outline-none text-2xl"
                placeholder="Email"
            />

            <input
                type="number"
                name="phone"
                minLength={10}
                maxLength={10}
                id=""
                required
                className="h-10 bg-gray-950 border-b-2  focus:outline-none text-2xl"
                placeholder="Phone"
            />

            <input
                type="text"
                name="username"
                minLength={3}
                id=""
                required
                className="h-10  bg-gray-950 border-b-2  focus:outline-none text-2xl"
                placeholder="Username"
            />

            <input
                type="password"
                name="password"
                minLength={3}
                required
                className="h-10  bg-gray-950 border-b-2  focus:outline-none text-2xl"
                placeholder="Password"
            />

            <button
                className="submit bg-blue-600 text-white py-2 px-5 rounded-md w-40 m-auto"
                name="intent"
                value="createUser"
            >
                submit
            </button>
        </Form>
    );
}