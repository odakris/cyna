import * as React from 'react';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CardActions from '@mui/joy/CardActions';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Typography from '@mui/joy/Typography';
import Check from '@mui/icons-material/Check';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { X } from 'lucide-react';

export default function PricingCards() {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
        gap: 2,
      }}
    >
      <Card size="lg" variant="outlined">
        <Chip size="sm" variant="outlined" color="neutral">
          Mensuel
        </Chip>
        <Typography level="h2">Accès de base</Typography>
        <Divider inset="none" />
        <List size="sm" sx={{ mx: 'calc(-1 * var(--ListItem-paddingX))' }}>
          <ListItem>
            <ListItemDecorator>
              <Check />
            </ListItemDecorator>
            Support Standard
          </ListItem>
          <ListItem>
            <ListItemDecorator>
              <Check />
            </ListItemDecorator>
            Essai gratuit de 14 jours
          </ListItem>
          <ListItem>
            <ListItemDecorator>
              <Check />
            </ListItemDecorator>
            Fonctionnalités basiques
          </ListItem>
          <ListItem>
            <ListItemDecorator>
              <X />
            </ListItemDecorator>
            Personnalisation
          </ListItem>
        </List>
        <Divider inset="none" />
        <CardActions>
          <Typography level="title-lg" sx={{ mr: 'auto' }}>
            15,00€{' '}
            <Typography textColor="text.tertiary" sx={{ fontSize: 'sm' }}>
              / mois
            </Typography>
          </Typography>
          <Button
            variant="soft"
            color="neutral"
            endDecorator={<KeyboardArrowRight />}
          >
            S'abonner
          </Button>
        </CardActions>
      </Card>
      
      <Card size="lg" variant="outlined">
        <Chip size="sm" variant="outlined" color="neutral">
          Annuel
        </Chip>
        <Typography level="h2">Accès complet</Typography>
        <Divider inset="none" />
        <List size="sm" sx={{ mx: 'calc(-1 * var(--ListItem-paddingX))' }}>
          <ListItem>
            <ListItemDecorator>
              <Check />
            </ListItemDecorator>
            Support Premium
          </ListItem>
          <ListItem>
            <ListItemDecorator>
              <Check />
            </ListItemDecorator>
            Essai gratuit de 30 jours
          </ListItem>
          <ListItem>
            <ListItemDecorator>
              <Check />
            </ListItemDecorator>
            Fonctionnalités complètes
          </ListItem>
          <ListItem>
            <ListItemDecorator>
              <Check />
            </ListItemDecorator>
            Personnalisation
          </ListItem>
        </List>
        <Divider inset="none" />
        <CardActions>
          <Typography level="title-lg" sx={{ mr: 'auto' }}>
            144,00€{' '}
            <Typography textColor="text.tertiary" sx={{ fontSize: 'sm' }}>
              / année
            </Typography>
          </Typography>
          <Button
            variant="soft"
            color="neutral"
            endDecorator={<KeyboardArrowRight />}
          >
            S'abonner
          </Button>
        </CardActions>
      </Card>
      
      <Card size="lg" variant="outlined">
        <Chip size="sm" variant="outlined" color="neutral">
          Par utilisateur
        </Chip>
        <Typography level="h2">Accès limité</Typography>
        <Divider inset="none" />
        <List size="sm" sx={{ mx: 'calc(-1 * var(--ListItem-paddingX))' }}>
          <ListItem>
            <ListItemDecorator>
              <Check />
            </ListItemDecorator>
            Support Standard
          </ListItem>
          <ListItem>
            <ListItemDecorator>
              <Check />
            </ListItemDecorator>
            Essai gratuit de 7 jours
          </ListItem>
          <ListItem>
            <ListItemDecorator>
              <Check />
            </ListItemDecorator>
            Fonctionnalités limitées
          </ListItem>
          <ListItem>
            <ListItemDecorator>
              <Check />
            </ListItemDecorator>
            Personnalisation
          </ListItem>
        </List>
        <Divider inset="none" />
        <CardActions>
          <Typography level="title-lg" sx={{ mr: 'auto' }}>
            10,00€{' '}
            <Typography textColor="text.tertiary" sx={{ fontSize: 'sm' }}>
              / mois
            </Typography>
          </Typography>
          <Button
            variant="soft"
            color="neutral"
            endDecorator={<KeyboardArrowRight />}
          >
            S'abonner
          </Button>
        </CardActions>
      </Card>
      <Card size="lg" variant="outlined">
        <Chip size="sm" variant="outlined" color="neutral">
          Par appareil
        </Chip>
        <Typography level="h2">Accès de base</Typography>
        <Divider inset="none" />
        <List size="sm" sx={{ mx: 'calc(-1 * var(--ListItem-paddingX))' }}>
          <ListItem>
            <ListItemDecorator>
              <Check />
            </ListItemDecorator>
            Support Standard
          </ListItem>
          <ListItem>
            <ListItemDecorator>
              <Check />
            </ListItemDecorator>
            Essai gratuit de 14 jours
          </ListItem>
          <ListItem>
            <ListItemDecorator>
              <Check />
            </ListItemDecorator>
            Fonctionnalités complètes
          </ListItem>
          <ListItem>
            <ListItemDecorator>
              <Check />
            </ListItemDecorator>
            Personnalisation
          </ListItem>
        </List>
        <Divider inset="none" />
        <CardActions>
          <Typography level="title-lg" sx={{ mr: 'auto' }}>
            15,00€{' '}
            <Typography textColor="text.tertiary" sx={{ fontSize: 'sm' }}>
              / month
            </Typography>
          </Typography>
          <Button
            variant="soft"
            color="neutral"
            endDecorator={<KeyboardArrowRight />}
          >
            S'abonner
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}
