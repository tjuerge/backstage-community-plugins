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

import useAsync from 'react-use/esm/useAsync';
import { Content, Page, Progress } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { ScorecardInfo } from '../ScorecardsInfo';
import Alert from '@material-ui/lab/Alert';
import { techInsightsApiRef } from '@backstage-community/plugin-tech-insights-react';
import { makeStyles } from '@material-ui/core/styles';
import { useEntity } from '@backstage/plugin-catalog-react';
import { getCompoundEntityRef } from '@backstage/catalog-model';
import { Check } from '@backstage-community/plugin-tech-insights-common';

const useStyles = makeStyles(() => ({
  contentScorecards: {
    paddingLeft: 0,
    paddingRight: 0,
  },
}));

export const ScorecardsContent = (props: {
  title: string;
  description?: string;
  checksId?: string[];
  filter?: (check: Check) => boolean;
  dense?: boolean;
}) => {
  const { title, description, checksId, filter, dense } = props;
  const classes = useStyles();
  const api = useApi(techInsightsApiRef);
  const { entity } = useEntity();
  const { namespace, kind, name } = getCompoundEntityRef(entity);
  const { value, loading, error } = useAsync(
    async () => await api.runChecks({ namespace, kind, name }, checksId),
  );

  const filteredValues =
    !filter || !value ? value : value.filter(val => filter(val.check));

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <Page themeId="home">
      <Content className={classes.contentScorecards}>
        <ScorecardInfo
          title={title}
          description={description}
          entity={entity}
          checkResults={filteredValues || []}
          dense={dense}
        />
      </Content>
    </Page>
  );
};
