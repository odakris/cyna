import * as React from "react"
import Card from "@mui/joy/Card"
import CardActions from "@mui/joy/CardActions"
import Chip from "@mui/joy/Chip"
import Divider from "@mui/joy/Divider"
import List from "@mui/joy/List"
import ListItem from "@mui/joy/ListItem"
import ListItemDecorator from "@mui/joy/ListItemDecorator"
import Typography from "@mui/joy/Typography"
import Check from "@mui/icons-material/Check"
import { X } from "lucide-react"
import Button from "@mui/joy/Button"
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight"

// Définir le type pour une carte de tarification
interface PricingCardProps {
  chipLabel: string
  planTitle: string
  features: string[]
  price: string
  period: string
  buttonText: string
}

const PricingCard = ({
  chipLabel,
  planTitle,
  features,
  price,
  period,
  buttonText,
}: PricingCardProps) => {
  return (
    <Card className="w-full mx-auto bg-white p-4 shadow-md rounded-2xl overflow-hidden border border-gray-300 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      {/* Chip Label */}
      <Chip size="sm" variant="outlined" color="neutral" className="mb-4">
        {chipLabel}
      </Chip>

      {/* Title */}
      <Typography level="h2" className="text-xl font-semibold text-center mb-4">
        {planTitle}
      </Typography>

      {/* Features List */}
      <Divider inset="none" className="mb-4" />
      <List size="sm" className="mx-0">
        {features.map((feature, index) => (
          <ListItem key={index} className="px-0">
            <ListItemDecorator>
              {feature.includes("Personnalisation") ? (
                <X className="text-red-500" />
              ) : (
                <Check className="text-green-500" />
              )}
            </ListItemDecorator>
            <Typography className="text-sm text-gray-700">{feature}</Typography>
          </ListItem>
        ))}
      </List>

      <Divider inset="none" className="my-4" />

      {/* Price and Button */}
      <CardActions className="flex justify-between items-center">
        <Typography
          level="title-lg"
          className="mr-auto text-lg font-semibold text-gray-900"
        >
          {price}{" "}
          <Typography textColor="text.tertiary" className="text-sm font-light">
            / {period}
          </Typography>
        </Typography>

        <Button
          variant="soft"
          color="neutral"
          endDecorator={<KeyboardArrowRight />}
          className="w-24 sm:w-32"
        >
          {buttonText}
        </Button>
      </CardActions>
    </Card>
  )
}

export default PricingCard
