import React, { FC, ReactElement } from 'react';
import { selectors } from '@grafana/e2e-selectors';

import { FormModel } from './LoginCtrl';
import { Button, Form, Input, Field } from '@grafana/ui';
import { css } from 'emotion';
import { config } from 'app/core/config';

interface Props {
  children: ReactElement;
  onSubmit: (data: FormModel) => void;
  isLoggingIn: boolean;
  passwordHint: string;
  loginHint: string;
}

const wrapperStyles = css`
  width: 100%;
  padding-bottom: 16px;
`;

export const submitButton = css`
  justify-content: center;
  width: 100%;
`;

export const LoginForm: FC<Props> = ({ children, onSubmit, isLoggingIn, passwordHint, loginHint }) => {
  const { isCollabInstance } = config;

  return (
    <div className={wrapperStyles}>
      <Form onSubmit={onSubmit} validateOn="onChange">
        {({ register, errors }) => (
          <>
            <Field
              label={!isCollabInstance ? 'Email' : 'Code Agence Principal'}
              invalid={!!errors.user}
              error={errors.user?.message}
            >
              <Input
                autoFocus
                name="user"
                ref={register({ required: 'Email obligatoire' })}
                placeholder={!isCollabInstance ? loginHint : 'en majuscule'}
                aria-label={selectors.pages.Login.username}
              />
            </Field>
            <Field label="Mot de passe" invalid={!!errors.password} error={errors.password?.message}>
              <Input
                name="password"
                type="password"
                placeholder={passwordHint}
                ref={register({ required: 'Mot de passe obligatoire' })}
                aria-label={selectors.pages.Login.password}
              />
            </Field>
            <Button aria-label={selectors.pages.Login.submit} className={submitButton} disabled={isLoggingIn}>
              {isLoggingIn ? 'Connexion...' : 'Se connecter'}
            </Button>
            {children}
          </>
        )}
      </Form>
    </div>
  );
};
