/*
 * Copyright 2021 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { ComponentType } from 'react';
import { Routes, Route, useOutlet } from 'react-router';
import { Entity } from '@backstage/catalog-model';
import { TemplateEntityV1beta3 } from '@backstage/plugin-scaffolder-common';
import { ScaffolderPage } from './ScaffolderPage';
import { TemplatePage } from './TemplatePage';
import { TaskPage } from './TaskPage';
import { ActionsPage } from './ActionsPage';
import { SecretsContextProvider } from './secrets/SecretsContext';

import {
  FieldExtensionOptions,
  FIELD_EXTENSION_WRAPPER_KEY,
  FIELD_EXTENSION_KEY,
  DEFAULT_SCAFFOLDER_FIELD_EXTENSIONS,
} from '../extensions';
import { useElementFilter } from '@backstage/core-plugin-api';

export type RouterProps = {
  /** @deprecated use components.TemplateCardComponent instead */
  TemplateCardComponent?:
    | ComponentType<{ template: TemplateEntityV1beta3 }>
    | undefined;
  /** @deprecated use component.TaskPageComponent instead */
  TaskPageComponent?: ComponentType<{}>;

  components?: {
    TemplateCardComponent?:
      | ComponentType<{ template: TemplateEntityV1beta3 }>
      | undefined;
    TaskPageComponent?: ComponentType<{}>;
  };
  groups?: Array<{
    title?: string;
    titleComponent?: React.ReactNode;
    filter: (entity: Entity) => boolean;
  }>;
};

export const Router = (props: RouterProps) => {
  const {
    TemplateCardComponent: legacyTemplateCardComponent,
    TaskPageComponent: legacyTaskPageComponent,
    groups,
    components = {},
  } = props;

  if (legacyTemplateCardComponent || legacyTaskPageComponent) {
    // eslint-disable-next-line no-console
    console.warn(
      "DEPRECATION: 'TemplateCardComponent' and 'TaskPageComponent' are deprecated when calling the 'ScaffolderPage'. Use 'components' prop to pass these component overrides instead.",
    );
  }

  const { TemplateCardComponent, TaskPageComponent } = components;

  const outlet = useOutlet();
  const TaskPageElement =
    TaskPageComponent ?? legacyTaskPageComponent ?? TaskPage;

  const customFieldExtensions = useElementFilter(outlet, elements =>
    elements
      .selectByComponentData({
        key: FIELD_EXTENSION_WRAPPER_KEY,
      })
      .findComponentData<FieldExtensionOptions>({
        key: FIELD_EXTENSION_KEY,
      }),
  );

  const fieldExtensions = [
    ...customFieldExtensions,
    ...DEFAULT_SCAFFOLDER_FIELD_EXTENSIONS.filter(
      ({ name }) =>
        !customFieldExtensions.some(
          customFieldExtension => customFieldExtension.name === name,
        ),
    ),
  ];

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ScaffolderPage
            groups={groups}
            TemplateCardComponent={
              TemplateCardComponent ?? legacyTemplateCardComponent
            }
          />
        }
      />
      <Route
        path="/templates/:templateName"
        element={
          <SecretsContextProvider>
            <TemplatePage customFieldExtensions={fieldExtensions} />
          </SecretsContextProvider>
        }
      />
      <Route path="/tasks/:taskId" element={<TaskPageElement />} />
      <Route path="/actions" element={<ActionsPage />} />
    </Routes>
  );
};
