import styled from '@emotion/styled'
import { Box } from '@mui/material'

export const PageContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.palette.spacing.toFooter,
  margin: '0px auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  padding: '10px',
  paddingTop: '0px',
  width: '70%',
  [theme.breakpoints.between('md', 'lg')]: {
    width: '90%',
    padding: '0px',
  },
  [theme.breakpoints.between('sm', 'md')]: {
    width: '90%',
    padding: '0px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    padding: '0px',
  },
}))

export const WalletTitleContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: '20px',
  [theme.breakpoints.down('md')]: {
    margin: '10px 0px',
  },
}))

export const WalletActionContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '20px',
  marginBottom: '10px',
  marginTop: '10px',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: '5px',
    alignItems: 'flex-start',
    'label': {
      margin: '0'
    }
  },
}))

export const PendingIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: '20px',
  [theme.breakpoints.down('sm')]: {
    alignItems: 'flex-start',
    margin: '10px 0px',
  },
}))
