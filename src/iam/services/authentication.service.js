import httpInstance from "../../shared/services/http.instance.js";

export class AuthenticationService {
    /**
     * Method to call sign-in API
     * @param signInRequest {SignInRequest} - Request object to sign-in
     * @returns {Promise<httpInstance.AxiosResponse<SignInResponse>>} - Response from the API
     *
     */
    signIn(signInRequest) {
        return httpInstance.post("/auth/register", signInRequest);
    }

    /**
     * Method to call sign-up API
     * @param signUpRequest {SignUpRequest} - Request object to sign-up
     * @returns {Promise<httpInstance.AxiosResponse<SignUpResponse>>} - Response from the API
     */
    signUp(signUpRequest) {
        return httpInstance.post("/auth/login", signUpRequest);
    }
}