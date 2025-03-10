"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Modal, Button } from "react-bootstrap";

import { checkValidity } from "../../../shared/utility";
import { useParams, useRouter } from "next/navigation";
import axios from "../axios";
import Link from "next/link";

const ViewUser = () => {
  const [state, setState] = useState({
    user: {
      userName: "",
      email: "",
      emailConfirmed: null,
      phoneNumber: null,
      phoneNumberConfirmed: null,
      twoFactorEnabled: null,
      lockoutEnabled: null,
      accessFailedCount: null,
      lockoutEnd: null,
    },
    showSetPasswordModal: false,
    showSendPasswordResetEmailModal: false,
    showSendEmailAddressConfirmationEmailModal: false,
    setPasswordModel: {
      id: "",
      password: "",
      confirmPassword: "",
    },
    controls: {
      password: {
        validation: {
          required: true,
        },
        error: {
          required: false,
        },
        valid: false,
        touched: false,
      },
    },
    submitted: false,
    errorMessage: null,
  });

  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState({});
  const [postError, setPostError] = useState(null);

  const fetchUser = async (id: string) => {
    try {
      const response = await axios.get(id);
      setUser(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  const setPasswordInit = () => {
    setPostError(null);
  };
  const setPassword = async (password) => {
    try {
      await axios.put(password.id + "/password", password);
      setState({
        ...state,
        showSetPasswordModal: false,
      });
    } catch (error) {
      setPostError(error);
    }
  };
  const sendPasswordResetEmailInit = () => {};
  const sendPasswordResetEmail = async (id: string) => {
    try {
      await axios.post(id + "/passwordresetemail", {
        id: id,
      });
      setState({ ...state, showSendPasswordResetEmailModal: false });
    } catch (error) {
      console.log(error);
    }
  };
  const sendEmailAddressConfirmationEmailInit = () => {};
  const sendEmailAddressConfirmationEmail = async (id: string) => {
    try {
      await axios.post(id + "/emailaddressconfirmation", {
        id: id,
      });
      setState({ ...state, showSendEmailAddressConfirmationEmailModal: false });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUser(id);
      setState({
        ...state,
        setPasswordModel: {
          ...state.setPasswordModel,
          id: id,
        },
      });
    }
  }, []);

  const back = () => {
    router.push("/users");
  };

  const showSetPasswordModal = () => {
    setState({
      ...state,
      showSetPasswordModal: true,
      setPasswordModel: {
        ...state.setPasswordModel,
        password: "",
        confirmPassword: "",
      },
      submitted: false,
    });
    setPasswordInit();
  };

  const cancelSetPassword = () => {
    setState({ ...state, showSetPasswordModal: false });
    setPasswordInit();
  };

  const showSendPasswordResetEmailModal = () => {
    setState({
      ...state,
      showSendPasswordResetEmailModal: true,
    });
    sendPasswordResetEmailInit();
  };

  const cancelSendPasswordResetEmail = () => {
    setState({ ...state, showSendPasswordResetEmailModal: false });
    sendPasswordResetEmailInit();
  };

  const showSendEmailAddressConfirmationEmailModal = () => {
    setState({
      ...state,
      showSendEmailAddressConfirmationEmailModal: true,
    });
    sendEmailAddressConfirmationEmailInit();
  };

  const cancelSendEmailAddressConfirmationEmail = () => {
    setState({ ...state, showSendEmailAddressConfirmationEmailModal: false });
    sendEmailAddressConfirmationEmailInit();
  };

  const fieldChanged = (event) => {
    const value = event.target.value;
    const setPasswordModel = {
      ...state.setPasswordModel,
      [event.target.name]: value,
    };

    checkFieldValidity(event.target.name, value);

    setState({ ...state, setPasswordModel: setPasswordModel });
  };

  const checkFieldValidity = (name, value) => {
    const control = state.controls[name];

    if (!control) return true;

    const rules = control.validation;
    const validationRs = checkValidity(value, rules);

    setState((preState) => ({
      ...preState,
      controls: {
        ...preState.controls,
        [name]: {
          ...preState.controls[name],
          error: validationRs,
          valid: validationRs.isValid,
        },
      },
    }));

    return validationRs.isValid;
  };

  const confirmSetPassword = (event) => {
    event.preventDefault();
    setState({ ...state, submitted: true });

    let isValid = true;
    for (const fieldName in state.controls) {
      isValid =
        checkFieldValidity(fieldName, state.setPasswordModel[fieldName]) &&
        isValid;
    }

    isValid =
      isValid &&
      state.setPasswordModel.password == state.setPasswordModel.confirmPassword;

    if (isValid) {
      setPassword(state.setPasswordModel);
    }
  };

  const passwordErrors = postError?.response?.data
    ? postError?.response?.data?.map((error) => (
        <li key={error.code}>{error.description}</li>
      ))
    : null;

  const setPasswordModal = (
    <Modal show={state.showSetPasswordModal} onHide={cancelSetPassword}>
      <Modal.Header closeButton>
        <Modal.Title>Set Password</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {passwordErrors ? (
          <div className="row alert alert-danger">
            <ul>{passwordErrors}</ul>
          </div>
        ) : null}
        {postError && !passwordErrors ? (
          <div className="row alert alert-danger">
            {postError?.response?.status}
          </div>
        ) : null}
        <form onSubmit={confirmSetPassword}>
          <div className="mb-3 row">
            <label htmlFor="userName" className="col-sm-4 col-form-label">
              User Name
            </label>
            <div className="col-sm-8">{user?.userName}</div>
          </div>
          <div className="mb-3 row">
            <label htmlFor="password" className="col-sm-4 col-form-label">
              Password
            </label>
            <div className="col-sm-8">
              <input
                type="password"
                id="password"
                name="password"
                className={
                  "form-control " +
                  (state.submitted && !state.controls["password"].valid
                    ? "is-invalid"
                    : "")
                }
                value={state.setPasswordModel?.password}
                onChange={(event) => fieldChanged(event)}
              />
              <span className="invalid-feedback">
                {state.controls["password"].error.required ? (
                  <span>Enter a password</span>
                ) : null}
              </span>
            </div>
          </div>
          <div className="mb-3 row">
            <label
              htmlFor="confirmPassword"
              className="col-sm-4 col-form-label"
            >
              Confirm Password
            </label>
            <div className="col-sm-8">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={
                  "form-control " +
                  (state.submitted &&
                  state.setPasswordModel?.password !=
                    state.setPasswordModel?.confirmPassword
                    ? "is-invalid"
                    : "")
                }
                value={state.setPasswordModel?.confirmPassword}
                onChange={(event) => fieldChanged(event)}
              />
              <span className="invalid-feedback">
                Confirm Password does not match
              </span>
            </div>
          </div>
          <div className="mb-3 row">
            <label className="col-sm-4 col-form-label"></label>
            <div className="col-sm-8">
              <button className="btn btn-primary">Save</button>
            </div>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );

  const sendPasswordResetEmailModal = (
    <Modal
      show={state.showSendPasswordResetEmailModal}
      onHide={cancelSendPasswordResetEmail}
    >
      <Modal.Header closeButton>
        <Modal.Title>Send Password Reset Email</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to send reset password email
        <strong> {user?.userName}</strong>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={cancelSendPasswordResetEmail}>
          No
        </Button>
        <Button
          variant="primary"
          onClick={() => sendPasswordResetEmail(user.id)}
        >
          Yes
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const sendEmailAddressConfirmationEmailModal = (
    <Modal
      show={state.showSendEmailAddressConfirmationEmailModal}
      onHide={cancelSendEmailAddressConfirmationEmail}
    >
      <Modal.Header closeButton>
        <Modal.Title>Send Email Address Confirmation Email</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to send email address confirmation email
        <strong> {user?.userName}</strong>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={cancelSendEmailAddressConfirmationEmail}
        >
          No
        </Button>
        <Button
          variant="primary"
          onClick={() => sendEmailAddressConfirmationEmail(user.id)}
        >
          Yes
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const page = user ? (
    <div className="card">
      <div className="card-header">{"User Detail: " + user.userName}</div>

      <div className="card-body">
        <div className="row">
          <div className="col-md-8">
            <div className="row">
              <div className="col-md-4">User Name:</div>
              <div className="col-md-8">{user.userName}</div>
            </div>
            <div className="row">
              <div className="col-md-4">Email:</div>
              <div className="col-md-8">{user.email}</div>
            </div>
            <div className="row">
              <div className="col-md-4">Email Confirmed:</div>
              <div className="col-md-8">
                {user.emailConfirmed ? "true" : "false"}
              </div>
            </div>
            <div className="row">
              <div className="col-md-4">Phone Number:</div>
              <div className="col-md-8">{user.phoneNumber}</div>
            </div>
            <div className="row">
              <div className="col-md-4">Phone Number Confirmed:</div>
              <div className="col-md-8">
                {user.phoneNumberConfirmed ? "true" : "false"}
              </div>
            </div>
            <div className="row">
              <div className="col-md-4">Two Factor Enabled:</div>
              <div className="col-md-8">
                {user.twoFactorEnabled ? "true" : "false"}
              </div>
            </div>
            <div className="row">
              <div className="col-md-4">Lockout Enabled:</div>
              <div className="col-md-8">
                {user.lockoutEnabled ? "true" : "false"}
              </div>
            </div>
            <div className="row">
              <div className="col-md-4">Access Failed Count:</div>
              <div className="col-md-8">{user.accessFailedCount}</div>
            </div>
            <div className="row">
              <div className="col-md-4">Lockout End:</div>
              <div className="col-md-8">{user.lockoutEnd}</div>
            </div>
          </div>

          <div className="col-md-4">
            <Image
              className="center-block img-responsive"
              alt=""
              style={{ width: "200px", margin: "2px" }}
              src={"../next.svg"}
              title={user.userName}
              width={50}
              height={50}
            />
          </div>
        </div>
      </div>

      <div className="card-footer">
        <button
          className="btn btn-outline-secondary"
          onClick={back}
          style={{ width: "80px" }}
        >
          <i className="fa fa-chevron-left"></i> Back
        </button>
        &nbsp;
        <Link className="btn btn-primary" href={"/users/edit/" + user.id}>
          Edit
        </Link>
        &nbsp;
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => showSetPasswordModal()}
        >
          Set Password
        </button>
        &nbsp;
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => showSendPasswordResetEmailModal()}
        >
          Send Password Reset Email
        </button>
        &nbsp;
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => showSendEmailAddressConfirmationEmailModal()}
        >
          Send Email Address Confirmation Email
        </button>
      </div>

      {setPasswordModal}
      {sendPasswordResetEmailModal}
      {sendEmailAddressConfirmationEmailModal}
    </div>
  ) : null;
  return page;
};

export default ViewUser;
