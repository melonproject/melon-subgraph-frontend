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
import TSLineChart from '~/components/TSLineChart';
import TooltipNumber from '~/components/TooltipNumber';

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

  const state = R.pathOr({}, ['data', 'state'], result) as any;
  const engineQuantities = R.pathOr({}, ['data', 'state', 'currentEngine'], result) as any;

  return (
    <Layout title="Engine">
      <Grid item={true} xs={12} sm={12} md={12}>
        <Paper className={props.classes.paper}>
          <Typography variant="h5">Melon Engine</Typography>
          <br />
          <Grid container={true}>
            <Grid item={true} xs={4} sm={4} md={4}>
              Amgu Price
            </Grid>
            <Grid item={true} xs={8} sm={8} md={8}>
              {engineQuantities && formatBigNumber(engineQuantities.amguPrice, 18, 7)} MLN{' '}
            </Grid>
            <Grid item={true} xs={4} sm={4} md={4}>
              Thawing Delay{' '}
            </Grid>
            <Grid item={true} xs={8} sm={8} md={8}>
              {engineQuantities && engineQuantities.thawingDelay / (24 * 3600)} days <div>&nbsp;</div>
            </Grid>
            <Grid item={true} xs={4} sm={4} md={4}>
              Total Amgu consumed{' '}
            </Grid>
            <Grid item={true} xs={8} sm={8} md={8}>
              {engineQuantities && formatThousands(engineQuantities.totalAmguConsumed)}{' '}
            </Grid>
            <Grid item={true} xs={4} sm={4} md={4}>
              Total Ether consumed{' '}
            </Grid>
            <Grid item={true} xs={8} sm={8} md={8}>
              <TooltipNumber number={engineQuantities.totalEtherConsumed} /> ETH
            </Grid>
            <Grid item={true} xs={4} sm={4} md={4}>
              Total MLN burned{' '}
            </Grid>
            <Grid item={true} xs={8} sm={8} md={8}>
              <TooltipNumber number={engineQuantities.totalMlnBurned} /> MLN
              <div>&nbsp;</div>
            </Grid>
            <Grid item={true} xs={4} sm={4} md={4}>
              Frozen Ether{' '}
            </Grid>
            <Grid item={true} xs={8} sm={8} md={8}>
              <TooltipNumber number={engineQuantities.frozenEther} /> ETH
            </Grid>
            <Grid item={true} xs={4} sm={4} md={4}>
              Liquid Ether{' '}
            </Grid>
            <Grid item={true} xs={8} sm={8} md={8}>
              <TooltipNumber number={engineQuantities.liquidEther} /> ETH
            </Grid>
            <Grid item={true} xs={4} sm={4} md={4}>
              Last Thaw
            </Grid>
            <Grid item={true} xs={8} sm={8} md={8}>
              {engineQuantities && formatDate(engineQuantities.lastThaw, true)}{' '}
            </Grid>
            <Grid item={true} xs={4} sm={4} md={4}>
              Current premium percent
            </Grid>
            <Grid item={true} xs={8} sm={8} md={8}>
              {engineQuantities && engineQuantities.premiumPercent}% <div>&nbsp;</div>
            </Grid>
            <Grid item={true} xs={4} sm={4} md={4}>
              Pricefeed last updated
            </Grid>
            <Grid item={true} xs={8} sm={8} md={8}>
              {state && formatDate(state.lastPriceUpdate, true)}{' '}
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      <Grid item={true} xs={12} sm={12} md={12}>
        <Paper className={props.classes.paper}>
          <Typography variant="h5">Cumulative amgu paid</Typography>
          <TSLineChart data={amguCumulative} dataKeys={['cumulativeAmount']} />
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
              },
              {
                title: 'Asset',
                render: rowData => {
                  return rowData.event === 'Thaw' ? 'ETH' : 'MLN';
                },
              },
            ]}
            data={engineQuantities && engineQuantities.etherEvents}
            title="Engine events"
            options={{
              paging: false,
              search: false,
            }}
          />
        </NoSsr>
      </Grid>
    </Layout>
  );
};

export default withStyles(styles)(Engine);
