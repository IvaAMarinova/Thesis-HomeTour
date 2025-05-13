import { ArrowUpDownIcon, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SearchSelectDropdownProps {
  options: string[];
  placeholder: string;
  onSelectionChange: (selectedValues: string[]) => void;
  initialSelection?: string[];
}

export function SearchSelectDropdown({
  options,
  placeholder,
  onSelectionChange,
  initialSelection = [],
}: SearchSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [selectedValues, setSelectedValues] =
    useState<string[]>(initialSelection);

  useEffect(() => {
    setSelectedValues(initialSelection);
  }, [initialSelection]);

  const handleSelect = (currentValue: string) => {
    const updatedSelection = selectedValues.includes(currentValue)
      ? selectedValues.filter((val) => val !== currentValue)
      : [...selectedValues, currentValue];
    setSelectedValues(updatedSelection);
    onSelectionChange(updatedSelection);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedValues.length === 1
            ? selectedValues[0]
            : `${selectedValues.length} избрани`}
          <ArrowUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput
            placeholder={`Search ${placeholder.toLowerCase()}...`}
          />
          <CommandList>
            <CommandEmpty>Не бяха открити опции</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => handleSelect(option)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedValues.includes(option)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
