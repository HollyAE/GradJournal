/* eslint-env jest */

import React from 'react';
import renderer from "react-test-renderer";
import { fireEvent, render } from "@testing-library/react-native";
import SignUpScreen from "../SignUpScreen";
import { NavigationContainer } from "@react-navigation/native";

describe("SignUp", () => {

  it("renders correctly", () => {
    const tree = renderer.create(
      <NavigationContainer>
        <SignUpScreen />
      </NavigationContainer>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("updates username, email, password fields", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <SignUpScreen />
      </NavigationContainer>
    );
    fireEvent.changeText(getByTestId('nameInput'), 'Test User');

    expect(getByTestId('nameInput').props.username).toBe('Test User');

  });


});