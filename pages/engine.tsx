import React from 'react';
import * as R from 'ramda';
import { Grid, withStyles, WithStyles, StyleRulesCallback, Typography, Paper, NoSsr } from '@material-ui/core';
import { AmguPaymentsQuery, EngineQuery } from '~/queries/EngineDetailsQuery';

import { useScrapingQuery, proceedPaths } from '~/utils/useScrapingQuery';
import Layout from '~/components/Layout';
import { formatDate } from '~/utils/formatDate';
import { formatBigNumber } from '~/utils/formatBigNumber';
import MaterialTable from 'material-table';
import { formatThousands } from '~/utils/formatThousands';
import TooltipNumber from '~/components/TooltipNumber';
import TSGroupedChart from '~/components/TSGroupedChart';
import { sortBigNumber } from '~/utils/sortBigNumber';

const styles: StyleRulesCallback = theme => ({
  paper: {
    padding: theme.spacing(2),
  },
});

type EngineProps = WithStyles<typeof styles>;

const Engine: React.FunctionComponent<EngineProps> = props => {
  const result = useScrapingQuery([EngineQuery, AmguPaymentsQuery], proceedPaths(['amguPayments']), {
    ssr: false,
  });

  const amguPayments = (result.data && result.data.amguPayments) || [];

  const amguCumulative: any[] = [];
  amguPayments.reduce((carry, item) => {
    amguCumulative.push({ ...item, cumulativeAmount: carry });
    return carry + parseInt(item.amount, 10);
  }, 0);

  const engineQuantities = R.pathOr({}, ['data', 'state', 'currentEngine'], result) as any;

  return (
    <Layout title="Melon Engine" page="engine">
      <Grid item={true} xs={12} sm={12} md={12}>
        <Paper className={props.classes.paper}>
          <Typography variant="h5">Melon Engine</Typography>
          <br />
          <Grid container={true}>
            <Grid item={true} xs={4} sm={4} md={4}>
              <Typography variant="caption">Total Amgu consumed </Typography>
            </Grid>
            <Grid item={true} xs={8} sm={8} md={8}>
              {engineQuantities && formatThousands(engineQuantities.totalAmguConsumed)}{' '}
            </Grid>
            <Grid item={true} xs={4} sm={4} md={4}>
              <Typography variant="caption">Amgu Price</Typography>
            </Grid>
            <Grid item={true} xs={8} sm={8} md={8}>
              {engineQuantities && formatBigNumber(engineQuantities.amguPrice, 18, 7)} MLN{' '}
            </Grid>
            <Grid item={true} xs={4} sm={4} md={4}>
              <Typography variant="caption">MLN burned</Typography>
            </Grid>
            <Grid item={true} xs={8} sm={8} md={8}>
              <TooltipNumber number={engineQuantities.totalMlnBurned} /> MLN
            </Grid>
            <Grid item={true} xs={4} sm={4} md={4}>
              <Typography variant="caption">Total MLN supply</Typography>
            </Grid>
            <Grid item={true} xs={8} sm={8} md={8}>
              n/a MLN
            </Grid>
            <Grid item={true} xs={4} sm={4} md={4}>
              <Typography variant="caption">ETH consumed</Typography>
            </Grid>
            <Grid item={true} xs={8} sm={8} md={8}>
              <TooltipNumber number={engineQuantities.totalEtherConsumed} /> ETH
            </Grid>
            <Grid item={true} xs={4} sm={4} md={4}>
              <Typography variant="caption">Engine premium</Typography>
            </Grid>
            <Grid item={true} xs={8} sm={8} md={8}>
              {engineQuantities && engineQuantities.premiumPercent}% <div>&nbsp;</div>
            </Grid>

            <Grid item={true} xs={4} sm={4} md={4}>
              <Typography variant="caption">Frozen ETH</Typography>
            </Grid>
            <Grid item={true} xs={8} sm={8} md={8}>
              <TooltipNumber number={engineQuantities.frozenEther} /> ETH
            </Grid>
            <Grid item={true} xs={4} sm={4} md={4}>
              <Typography variant="caption">Liquid ETH</Typography>
            </Grid>
            <Grid item={true} xs={8} sm={8} md={8}>
              <TooltipNumber number={engineQuantities.liquidEther} /> ETH
            </Grid>
            <Grid item={true} xs={4} sm={4} md={4}>
              <Typography variant="caption">Last thaw</Typography>
            </Grid>
            <Grid item={true} xs={8} sm={8} md={8}>
              {engineQuantities && formatDate(engineQuantities.lastThaw, true)}{' '}
            </Grid>

            <Grid item={true} xs={4} sm={4} md={4}>
              <Typography variant="caption">Thawing Delay</Typography>
            </Grid>
            <Grid item={true} xs={8} sm={8} md={8}>
              {engineQuantities && engineQuantities.thawingDelay / (24 * 3600)} days
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      <Grid item={true} xs={12} sm={12} md={12}>
        <Paper className={props.classes.paper}>
          <Typography variant="h5">Amgu consumed</Typography>
          <TSGroupedChart data={amguPayments} dataKeys={['amount']} />
        </Paper>
      </Grid>
      <Grid item={true} xs={12} sm={12} md={12}>
        <NoSsr>
          <MaterialTable
            columns={[
              {
                title: 'Time',
                render: rowData => {
                  return formatDate(rowData.timestamp, true);
                },
                customSort: (a, b) => sortBigNumber(a, b, 'timestamp'),
                defaultSort: 'desc',
                cellStyle: {
                  whiteSpace: 'nowrap',
                },
                headerStyle: {
                  whiteSpace: 'nowrap',
                },
              },
              {
                title: 'Event',
                field: 'event',
              },
              {
                title: 'Amount',
                render: rowData => {
                  return <TooltipNumber number={rowData.amount} />;
                },
                type: 'numeric',
                sorting: false,
              },
              {
                title: 'Asset',
                render: rowData => {
                  return rowData.event === 'Thaw' ? 'ETH' : 'MLN';
                },
                sorting: false,
              },
            ]}
            data={engineQuantities && engineQuantities.etherEvents}
            title="Engine events"
            options={{
              paging: false,
              search: false,
            }}
            onRowClick={(_, rowData) => {
              const url = 'https://etherscan.io/tx/' + rowData.id;
              window.open(url, '_blank');
            }}
          />
        </NoSsr>
      </Grid>
    </Layout>
  );
};

export default withStyles(styles)(Engine);
