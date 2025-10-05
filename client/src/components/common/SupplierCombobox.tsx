import { useState, useEffect, useMemo } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';

import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useSuppliers, useCreateSupplier, Supplier } from '@/hooks/useSuppliers';
import { CreateSupplierDialog } from './CreateSupplierDialog';

interface SupplierComboboxProps {
  value?: number;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SupplierCombobox({
  value,
  onChange,
  placeholder = "Выберите поставщика",
  disabled = false,
}: SupplierComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [tempSupplier, setTempSupplier] = useState<Supplier | null>(null);

  const { data: suppliersData } = useSuppliers();
  const createMutation = useCreateSupplier();

  const suppliers = useMemo(() => suppliersData?.data || [], [suppliersData?.data]);
  const selectedSupplier = suppliers.find((s) => s.id === value) || 
    (tempSupplier?.id === value ? tempSupplier : null);

  // Очищаем временного поставщика когда он появляется в основном списке
  useEffect(() => {
    if (tempSupplier && suppliers.some(s => s.id === tempSupplier.id)) {
      setTempSupplier(null);
    }
  }, [suppliers, tempSupplier]);

  // Фильтруем поставщиков по поиску
  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateSupplier = async (data: { name: string; phone?: string; email?: string }) => {
    try {
      const newSupplier = await createMutation.mutateAsync({
        name: data.name,
        phone: data.phone,
        email: data.email,
        paymentTerms: 0,
      });
      
      // Временно сохраняем созданного поставщика
      setTempSupplier(newSupplier);
      
      // Закрываем диалог и очищаем поиск
      setShowCreateDialog(false);
      setSearch('');
      
      // Устанавливаем значение нового поставщика
      onChange(newSupplier.id);
      
      // tempSupplier будет автоматически очищен через useEffect когда данные обновятся
    } catch (error) {
      console.error('Ошибка при создании поставщика:', error);
    }
  };

  const handleOpenCreateDialog = () => {
    setShowCreateDialog(true);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between"
          >
            {selectedSupplier ? selectedSupplier.name : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Поиск поставщика..." 
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {filteredSuppliers.length === 0 ? (
                <CommandEmpty>
                  <div className="py-4 text-center text-sm">
                    <p className="mb-3">Поставщик не найден</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mx-auto"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleOpenCreateDialog();
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Создать "{search || 'нового поставщика'}"
                    </Button>
                  </div>
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredSuppliers.map((supplier) => (
                    <div
                      key={supplier.id}
                      onClick={() => {
                        console.log('✅ Клик на поставщика:', supplier.id, supplier.name);
                        onChange(supplier.id);
                        setSearch('');
                        setOpen(false);
                      }}
                      className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === supplier.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{supplier.name}</span>
                        {supplier.phone && (
                          <span className="text-xs text-muted-foreground">
                            {supplier.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="border-t mt-1 pt-1">
                    <div
                      onClick={handleOpenCreateDialog}
                      className="relative flex cursor-pointer select-none items-center justify-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-primary"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Создать нового поставщика
                    </div>
                  </div>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <CreateSupplierDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateSupplier}
        defaultName={search}
        isLoading={createMutation.isPending}
      />
    </>
  );
}
